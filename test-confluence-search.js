#!/usr/bin/env node

// Test script to search for "SOP: Defects/Bugs Process" page in Confluence
const { spawn } = require('child_process');

// Load environment variables
require('dotenv').config();

console.log('Testing Confluence search for "SOP: Defects/Bugs Process"...');

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

// Test CQL search for the specific page
const searchRequest = {
  jsonrpc: "2.0",
  id: 2,
  method: "tools/call",
  params: {
    name: "execute_cql_search",
    arguments: {
      cql: "title ~ \"SOP: Defects/Bugs Process\"",
      limit: 5
    }
  }
};

console.log('Searching for page: "SOP: Defects/Bugs Process"');

// Send the search request
mcpServer.stdin.write(JSON.stringify(searchRequest) + '\n');

// Listen for responses
mcpServer.stdout.on('data', (data) => {
  try {
    const response = JSON.parse(data.toString());
    console.log('Search Results:');
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
  console.log('Search test completed');
  process.exit(0);
}, 15000);