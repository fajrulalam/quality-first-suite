#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Read user query from file
const userQuery = fs.readFileSync('user_query.txt', 'utf8').trim();
console.log('User Query:', userQuery);

// Prompt template for converting natural language to CQL
const cqlPrompt = `
<role>
You are an expert Confluence search assistant. Your sole responsibility is to convert a user's natural language question into a single, valid, and efficient Confluence Query Language (CQL) query. You must adhere strictly to the provided examples and output format.
</role>

<instructions>
1. Analyze the user's question to identify key entities: keywords, space keys, labels, content types (page, blogpost), users (creator, mention), and date ranges.
2. Construct a CQL query that accurately reflects the user's intent.
3. Use operators like '=', '~', '!=', 'IN', 'AND', 'OR', 'NOT'.
4. Use functions like 'currentUser()', 'now()', 'startOfMonth()', 'startOfYear()' where appropriate.
5. Prioritize filtering by 'space' and 'type' for efficiency.
6. Your final output must be ONLY the CQL query, enclosed in \`<cql>\` tags. Do not add any explanation or preamble.
</instructions>

<examples>
<example>
<question>Find me pages about 'Project Phoenix' in the Engineering space.</question>
<cql_query>space = 'ENG' AND title ~ 'Project Phoenix'</cql_query>
</example>
<example>
<question>Show me all blog posts with the 'security' label from last month.</question>
<cql_query>type = blogpost AND label = 'security' AND created > startOfMonth("-1M")</cql_query>
</example>
<example>
<question>Who created pages mentioning 'Q3 planning' but not in the 'Archive' space?</question>
<cql_query>text ~ 'Q3 planning' AND space != 'ARCH'</cql_query>
</example>
<example>
<question>I need documents from the 'Marketing' (MKT) or 'Sales' (SALES) spaces that mention either 'roadmap' or 'strategy'.</question>
<cql_query>space IN ('MKT', 'SALES') AND text ~ 'roadmap OR strategy'</cql_query>
</example>
<example>
<question>Find attachments on pages created by me in the last 7 days.</question>
<cql_query>type = attachment AND creator = currentUser() AND created >= now("-7d")</cql_query>
</example>
</examples>

<task>
<user_question>${userQuery}</user_question>
<cql_output>
<cql>`;

// For this demo, let's simulate Claude's response with a reasonable CQL query
// In a real implementation, you would send this to Claude API
const simulatedCqlResponse = 'type = page AND (title ~ "defect" OR title ~ "bug" OR text ~ "defect process" OR text ~ "bug process")';

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
      limit: 3
    }
  }
};

mcpServer.stdin.write(JSON.stringify(searchRequest) + '\n');

let searchResults = '';
let logContent = `=== RAG Testing Log ===
Timestamp: ${new Date().toISOString()}
User Query: ${userQuery}
Generated CQL: ${simulatedCqlResponse}

=== Search Results ===
`;

mcpServer.stdout.on('data', (data) => {
  try {
    const response = JSON.parse(data.toString());
    if (response.result && response.result.content) {
      const resultsData = JSON.parse(response.result.content[0].text);
      logContent += JSON.stringify(resultsData, null, 2) + '\\n\\n';
      
      // If we found pages, get the content of the first one
      if (resultsData.results && resultsData.results.length > 0) {
        const firstPage = resultsData.results[0];
        logContent += `=== Selected Page ===
Title: ${firstPage.title}
Page ID: ${firstPage.id}
URL: ${firstPage._links.webui}

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
        
        mcpServer.stdin.write(JSON.stringify(pageContentRequest) + '\n');
      }
    } else if (response.id === 2) {
      // This is the page content response
      const pageData = JSON.parse(response.result.content[0].text);
      logContent += `Page Content Summary:
Title: ${pageData.title}
Space: ${pageData.space.name} (${pageData.space.key})
Last Modified: ${pageData.version.when}
Modified By: ${pageData.version.by.displayName}

Content Preview:
${pageData.body.storage.value.substring(0, 1000)}...

=== End of Log ===`;
      
      // Write log file
      fs.writeFileSync(logFileName, logContent);
      console.log(`\nTest completed! Results saved to: ${logFileName}`);
      
      mcpServer.kill();
      process.exit(0);
    }
  } catch (e) {
    console.log('Raw Response:', data.toString());
  }
});

mcpServer.stderr.on('data', (data) => {
  console.error('MCP Error:', data.toString());
});

mcpServer.on('close', (code) => {
  console.log(`MCP server exited with code ${code}`);
});

// Cleanup after 30 seconds if no response
setTimeout(() => {
  mcpServer.kill();
  console.log('Test timed out');
  process.exit(1);
}, 30000);