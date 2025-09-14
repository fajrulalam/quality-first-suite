#!/usr/bin/env node

// Simple test script to verify MCP server can communicate with Confluence
const { spawn } = require('child_process');
const readline = require('readline');

// Load environment variables from .env file
require('dotenv').config();

console.log('Testing MCP server connection to Confluence...');
console.log('Confluence URL:', process.env.CONFLUENCE_URL);

// Start the MCP server as a child process
const mcpServer = spawn('npx', ['-y', '@zereight/mcp-confluence'], {
  env: {
    ...process.env,
    CONFLUENCE_URL: process.env.CONFLUENCE_URL,
    JIRA_URL: process.env.JIRA_URL,
    CONFLUENCE_API_MAIL: process.env.CONFLUENCE_API_MAIL,
    CONFLUENCE_API_KEY: process.env.CONFLUENCE_API_KEY,
    CONFLUENCE_IS_CLOUD: process.env.CONFLUENCE_IS_CLOUD
  },
  stdio: ['pipe', 'pipe', 'pipe']
});

// Test request to list available tools
const testRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/list",
  params: {}
};

// Send the test request
mcpServer.stdin.write(JSON.stringify(testRequest) + '\n');

// Listen for responses
mcpServer.stdout.on('data', (data) => {
  console.log('MCP Response:', data.toString());
});

mcpServer.stderr.on('data', (data) => {
  console.error('MCP Error:', data.toString());
});

mcpServer.on('close', (code) => {
  console.log(`MCP server exited with code ${code}`);
});

// Cleanup after 10 seconds
setTimeout(() => {
  mcpServer.kill();
  console.log('Test completed');
  process.exit(0);
}, 10000);