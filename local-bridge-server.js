#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const app = express();
const PORT = process.env.BRIDGE_PORT || 3001;

// Enable CORS for all origins (since we want Vercel to access this)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'Local VPN Bridge Server is running',
    timestamp: new Date().toISOString(),
    vpnStatus: 'assumed-connected'
  });
});

// Execute cURL command locally (with VPN access)
app.post('/execute-curl', async (req, res) => {
  try {
    const { curlCommand } = req.body;
    
    if (!curlCommand) {
      return res.status(400).json({
        success: false,
        error: 'No cURL command provided'
      });
    }

    console.log('🔄 Executing cURL locally with VPN access...');
    console.log('📋 Command:', curlCommand.substring(0, 100) + '...');

    // Clean up the cURL command
    const cleanedCurl = curlCommand
      .replace(/\\\s*\n\s*/g, ' ') // Remove line continuations
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Add timeout to prevent hanging
    const curlWithTimeout = `timeout 30s ${cleanedCurl}`;

    // Execute the cURL command
    const startTime = Date.now();
    const { stdout, stderr } = await execAsync(curlWithTimeout, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      timeout: 35000 // 35 second timeout
    });

    const executionTime = Date.now() - startTime;

    console.log('✅ cURL executed successfully');
    console.log('⏱️  Execution time:', executionTime + 'ms');

    // Try to parse response as JSON for better formatting
    let responseData = stdout;
    let isJson = false;
    try {
      JSON.parse(stdout);
      isJson = true;
    } catch {
      // Not JSON, keep as string
    }

    res.json({
      success: true,
      response: responseData,
      isJson,
      executionTime,
      stderr: stderr || null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ cURL execution failed:', error.message);

    let errorMessage = error.message;
    let statusHint = '';

    // Provide helpful error messages
    if (error.message.includes('timeout')) {
      errorMessage = 'Request timed out (30s limit)';
      statusHint = 'The API might be slow or unreachable';
    } else if (error.message.includes('Command failed')) {
      errorMessage = 'cURL command failed to execute';
      statusHint = 'Check if the URL is accessible via VPN';
    } else if (error.message.includes('not found')) {
      errorMessage = 'cURL command not found';
      statusHint = 'Make sure cURL is installed on your system';
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      hint: statusHint,
      timestamp: new Date().toISOString()
    });
  }
});

// Get local network info
app.get('/network-info', (req, res) => {
  const networkInterfaces = require('os').networkInterfaces();
  const interfaces = {};
  
  Object.keys(networkInterfaces).forEach(name => {
    interfaces[name] = networkInterfaces[name]
      .filter(iface => !iface.internal && iface.family === 'IPv4')
      .map(iface => ({ address: iface.address, netmask: iface.netmask }));
  });

  res.json({
    interfaces,
    hostname: require('os').hostname(),
    platform: require('os').platform(),
    uptime: require('os').uptime()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 Local VPN Bridge Server started!');
  console.log(`📡 Listening on http://localhost:${PORT}`);
  console.log(`🔗 External access: http://0.0.0.0:${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log('\n📋 Usage from Vercel:');
  console.log(`   POST http://YOUR_LOCAL_IP:${PORT}/execute-curl`);
  console.log(`   Body: { "curlCommand": "curl ..." }`);
  console.log('\n🔒 VPN Status: Assuming connected (this server uses your local network)');
  console.log('\n⚠️  Make sure your firewall allows connections on port', PORT);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Local VPN Bridge Server...');
  process.exit(0);
});