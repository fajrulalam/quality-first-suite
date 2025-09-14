#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
require('dotenv').config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Read user query from file
const userQuery = fs.readFileSync('user_query.txt', 'utf8').trim();
console.log('User Query:', userQuery);

// Simulate CQL conversion (in real implementation, this would use Claude)
const simulatedCqlResponse = 'title ~ "SOP" AND (title ~ "defect" OR title ~ "bug")';
console.log('Generated CQL Query:', simulatedCqlResponse);

// Create timestamp for log files
const timestamp = Math.floor(Date.now() / 1000);
const replyLogFileName = `testing_logs/test_reply_${timestamp}.txt`;

// Function to create structured prompt for Gemini
function createGeminiPrompt(userQuestion, documents) {
  return `<role>
You are an expert assistant specializing in answering questions based on a private knowledge base from Confluence. Your answers must be derived exclusively from the documents provided.
</role>

<instructions>
1. Carefully read the user's question and all the provided documents.
2. Synthesize a comprehensive and clear answer to the user's question.
3. Your answer MUST be based ONLY on the information contained within the <documents> tags. Do not use any of your own prior knowledge.
4. For every statement or claim in your answer, you must provide a citation. The citation should be the title of the source document, formatted as \`[Document Title]\`.
5. If the provided documents do not contain enough information to answer the question, you must respond with the exact phrase: "I could not find the information in the knowledge base to answer your question."
6. Structure your answer in clear, easy-to-read paragraphs.
</instructions>

<documents>
${documents}
</documents>

<task>
<question>
${userQuestion}
</question>
<answer>`;
}

// Function to format Confluence content for Gemini
function formatDocumentForGemini(pageData) {
  // Convert HTML to more readable format by removing most HTML tags
  let content = pageData.body.storage.value
    .replace(/<h([1-6])>/g, '\n\n## ')
    .replace(/<\/h[1-6]>/g, '\n')
    .replace(/<p>/g, '\n')
    .replace(/<\/p>/g, '')
    .replace(/<ul>/g, '\n')
    .replace(/<\/ul>/g, '')
    .replace(/<li>/g, '\n• ')
    .replace(/<\/li>/g, '')
    .replace(/<strong>/g, '**')
    .replace(/<\/strong>/g, '**')
    .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
    .replace(/\n\s*\n/g, '\n\n') // Clean up multiple newlines
    .trim();

  return `<document>
<title>${pageData.title}</title>
<space>${pageData.space.name}</space>
<last_modified>${pageData.version.when}</last_modified>
<content>
${content}
</content>
</document>`;
}

async function testCompleteRAG() {
  console.log('=== Starting Complete RAG Test ===');
  
  let ragLog = `=== Complete RAG Pipeline Test ===
Timestamp: ${new Date().toISOString()}
User Query: ${userQuery}
Generated CQL: ${simulatedCqlResponse}

=== Step 1: Confluence Retrieval ===
`;

  // Start MCP server for Confluence retrieval
  console.log('Step 1: Retrieving from Confluence...');
  
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

  let allDataReceived = '';
  let pageData = null;

  return new Promise((resolve, reject) => {
    mcpServer.stdin.write(JSON.stringify(searchRequest) + '\n');

    mcpServer.stdout.on('data', (data) => {
      allDataReceived += data.toString();
      
      const lines = allDataReceived.split('\n');
      
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (line) {
          try {
            const response = JSON.parse(line);
            
            if (response.id === 1) {
              // Search response
              const resultsData = JSON.parse(response.result.content[0].text);
              ragLog += `Found ${resultsData.results.length} pages\n`;
              ragLog += `Selected: ${resultsData.results[0].title}\n\n`;
              
              // Get page content
              const pageContentRequest = {
                jsonrpc: "2.0",
                id: 2,
                method: "tools/call",
                params: {
                  name: "get_page_content",
                  arguments: {
                    pageId: resultsData.results[0].id
                  }
                }
              };
              
              mcpServer.stdin.write(JSON.stringify(pageContentRequest) + '\n');
              
            } else if (response.id === 2) {
              // Page content response
              pageData = JSON.parse(response.result.content[0].text);
              ragLog += `=== Step 2: Gemini Generation ===\n`;
              
              // Format document for Gemini
              const formattedDoc = formatDocumentForGemini(pageData);
              const geminiPrompt = createGeminiPrompt(userQuery, formattedDoc);
              
              ragLog += `Sending to Gemini model: gemini-1.5-flash\n`;
              ragLog += `Document: ${pageData.title}\n\n`;
              
              // Send to Gemini
              console.log('Step 2: Sending to Gemini...');
              
              model.generateContent(geminiPrompt)
                .then(result => {
                  const response = result.response;
                  const generatedAnswer = response.text();
                  
                  ragLog += `=== Gemini Response ===\n`;
                  ragLog += generatedAnswer;
                  ragLog += `\n\n=== End of RAG Pipeline ===`;
                  
                  // Write complete log
                  fs.writeFileSync(replyLogFileName, ragLog);
                  console.log(`\n✅ Complete RAG test successful!`);
                  console.log(`📄 Results saved to: ${replyLogFileName}`);
                  
                  mcpServer.kill();
                  resolve();
                })
                .catch(error => {
                  ragLog += `=== Gemini Error ===\n${error.message}\n`;
                  fs.writeFileSync(replyLogFileName, ragLog);
                  console.error('❌ Gemini error:', error);
                  mcpServer.kill();
                  reject(error);
                });
            }
          } catch (e) {
            // Not valid JSON, continue
          }
        }
      }
      
      allDataReceived = lines[lines.length - 1];
    });

    mcpServer.stderr.on('data', (data) => {
      console.error('MCP Error:', data.toString());
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      ragLog += '\n\n=== Test Timed Out ===';
      fs.writeFileSync(replyLogFileName, ragLog);
      mcpServer.kill();
      reject(new Error('Test timed out'));
    }, 30000);
  });
}

// Run the complete RAG test
testCompleteRAG()
  .then(() => {
    console.log('🎉 RAG pipeline test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ RAG pipeline test failed:', error.message);
    process.exit(1);
  });