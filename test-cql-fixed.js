#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

// Read user query from file
const userQuery = fs.readFileSync('user_query.txt', 'utf8').trim();
console.log('User Query:', userQuery);

// Simulate a smarter CQL query for defect processes
const simulatedCqlResponse = 'title ~ "SOP" AND (title ~ "defect" OR title ~ "bug")';
console.log('Generated CQL Query:', simulatedCqlResponse);

// Create timestamp for log file
const timestamp = Math.floor(Date.now() / 1000);
const logFileName = `testing_logs/test_mcp_${timestamp}.txt`;

// Start MCP server and execute the CQL query
console.log('Starting MCP server to execute CQL query...');

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

// Execute CQL search
const searchRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "execute_cql_search",
    arguments: {
      cql: simulatedCqlResponse,
      limit: 1
    }
  }
};

let logContent = `=== RAG Testing Log ===
Timestamp: ${new Date().toISOString()}
User Query: ${userQuery}
Generated CQL: ${simulatedCqlResponse}

=== Search Results ===
`;

let responses = [];
let allDataReceived = '';

mcpServer.stdin.write(JSON.stringify(searchRequest) + '\n');

mcpServer.stdout.on('data', (data) => {
  allDataReceived += data.toString();
  
  // Try to parse each line as JSON
  const lines = allDataReceived.split('\n');
  
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i].trim();
    if (line) {
      try {
        const response = JSON.parse(line);
        responses.push(response);
        
        if (response.id === 1) {
          // This is the search response
          console.log('Received search response');
          const resultsData = JSON.parse(response.result.content[0].text);
          logContent += JSON.stringify(resultsData, null, 2) + '\n\n';
          
          if (resultsData.results && resultsData.results.length > 0) {
            const firstPage = resultsData.results[0];
            logContent += `=== Selected Page ===
Title: ${firstPage.title}
Page ID: ${firstPage.id}
URL: https://borobudur.atlassian.net/wiki${firstPage._links.webui}

=== Fetching Page Content ===
`;
            
            // Get page content
            const pageContentRequest = {
              jsonrpc: "2.0",
              id: 2,
              method: "tools/call",
              params: {
                name: "get_page_content",
                arguments: {
                  pageId: firstPage.id
                }
              }
            };
            
            console.log('Requesting page content...');
            mcpServer.stdin.write(JSON.stringify(pageContentRequest) + '\n');
          }
        } else if (response.id === 2) {
          // This is the page content response
          console.log('Received page content response');
          const pageData = JSON.parse(response.result.content[0].text);
          logContent += `Page Content Summary:
Title: ${pageData.title}
Space: ${pageData.space.name} (${pageData.space.key})
Last Modified: ${pageData.version.when}
Modified By: ${pageData.version.by.displayName}

Content Preview (first 1000 chars):
${pageData.body.storage.value.substring(0, 1000)}...

=== Full Content ===
${pageData.body.storage.value}

=== End of Log ===`;
          
          // Write log file
          fs.writeFileSync(logFileName, logContent);
          console.log(`\nTest completed successfully! Results saved to: ${logFileName}`);
          
          mcpServer.kill();
          process.exit(0);
        }
      } catch (e) {
        // Not valid JSON, continue
      }
    }
  }
  
  // Keep the last incomplete line
  allDataReceived = lines[lines.length - 1];
});

mcpServer.stderr.on('data', (data) => {
  console.error('MCP Error:', data.toString());
});

mcpServer.on('close', (code) => {
  console.log(`MCP server exited with code ${code}`);
});

// Cleanup after 30 seconds if no response
setTimeout(() => {
  logContent += '\n\n=== Test Timed Out ===';
  fs.writeFileSync(logFileName, logContent);
  console.log(`\nTest timed out! Partial results saved to: ${logFileName}`);
  mcpServer.kill();
  process.exit(1);
}, 30000);