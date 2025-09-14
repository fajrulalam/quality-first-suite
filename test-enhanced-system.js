#!/usr/bin/env node

const fs = require('fs');

// Read user query from file
const userQuery = fs.readFileSync('user_query.txt', 'utf8').trim();
console.log('Testing Enhanced RAG System');
console.log('User Query:', userQuery);

async function testEnhancedSystem() {
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userQuery,
        conversationHistory: []
      }),
    });

    const data = await response.json();

    const timestamp = Math.floor(Date.now() / 1000);
    const logFileName = `testing_logs/enhanced_test_${timestamp}.txt`;

    let logContent = `=== Enhanced RAG System Test ===
Timestamp: ${new Date().toISOString()}
User Query: ${userQuery}

=== Process Steps ===
${data.processSteps ? data.processSteps.map(step => 
  `${step.status === 'completed' ? '✅' : step.status === 'error' ? '❌' : '⏳'} ${step.step}${step.details ? ` - ${step.details}` : ''}`
).join('\n') : 'No process steps'}

=== Search Results ===
${data.searchDetails ? `Found ${data.searchDetails.totalPagesFound} total pages
Used ${data.searchDetails.pagesUsed} pages
Token usage: ${data.searchDetails.tokensUsed}/400` : 'No search details'}

=== Source Documents ===
${data.sourceDocuments ? data.sourceDocuments.map((doc, idx) => 
  `${idx + 1}. ${doc.title} (${doc.space}) - Relevance: ${doc.relevanceScore}/10
   URL: ${doc.url}`
).join('\n') : 'No sources'}

=== Generated Response ===
${data.reply}

=== System Performance ===
Multi-source retrieval: ${data.sourceDocuments?.length > 1 ? 'SUCCESS' : 'LIMITED'}
Relevance ranking: ${data.sourceDocuments?.some(d => d.relevanceScore) ? 'ACTIVE' : 'NOT APPLIED'}
Token management: ${data.searchDetails?.tokensUsed <= 400 ? 'WITHIN LIMITS' : 'EXCEEDED'}

=== End of Test ===`;

    fs.writeFileSync(logFileName, logContent);
    console.log(`\n✅ Enhanced system test completed!`);
    console.log(`📄 Results saved to: ${logFileName}`);
    console.log(`\n📊 Summary:`);
    console.log(`- Sources found: ${data.sourceDocuments?.length || 0}`);
    console.log(`- Total pages searched: ${data.searchDetails?.totalPagesFound || 0}`);
    console.log(`- Token usage: ${data.searchDetails?.tokensUsed || 0}/400`);
    console.log(`- Multi-source enabled: ${data.sourceDocuments?.length > 1 ? 'YES' : 'NO'}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEnhancedSystem();