#!/usr/bin/env node

// Test script to fetch content of "SOP: Defects/Bugs Process" page
const { spawn } = require('child_process');

// Load environment variables
require('dotenv').config();

console.log('Testing Confluence page content retrieval...');

// Start the MCP server
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

// Test getting page content using the page ID we found
const pageContentRequest = {
  jsonrpc: "2.0",
  id: 3,
  method: "tools/call",
  params: {
    name: "get_page_content",
    arguments: {
      pageId: "2759491586"
    }
  }
};

console.log('Fetching content for page ID: 2759491586');

// Send the page content request
mcpServer.stdin.write(JSON.stringify(pageContentRequest) + '\n');

// Listen for responses
mcpServer.stdout.on('data', (data) => {
  try {
    const response = JSON.parse(data.toString());
    console.log('Page Content Response:');
    console.log(JSON.stringify(response, null, 2));
  } catch (e) {
    console.log('Raw Response:', data.toString());
  }
});

mcpServer.stderr.on('data', (data) => {
  console.error('Error:', data.toString());
});

mcpServer.on('close', (code) => {
  console.log(`MCP server exited with code ${code}`);
});

// Cleanup after 15 seconds
setTimeout(() => {
  mcpServer.kill();
  console.log('Page content test completed');
  process.exit(0);
}, 15000);