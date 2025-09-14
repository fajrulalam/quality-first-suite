const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function test3ColumnFormat() {
  try {
    console.log('🧪 Testing CORRECT 3-column format: API Name, cURL, Variables...\n');
    
    const form = new FormData();
    form.append('file', fs.createReadStream('correct-3-column-test.xlsx'));
    form.append('useProxy', 'true');
    form.append('sessionAccessToken', '');
    form.append('sessionRefreshToken', '');
    
    console.log('📤 Sending 3-column format test to API...');
    const response = await fetch('http://localhost:3002/api/api-test-cases/process', {
      method: 'POST',
      body: form
    });
    
    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      return;
    }
    
    console.log('✅ API responded, checking 3-column format...\n');
    
    const responseText = await response.text();
    const lines = responseText.split('\n').filter(line => line.trim());
    
    let apiNamesFound = new Set();
    let totalTests = 0;
    let testsByAPI = {};
    let progressFound = false;
    
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        
        if (data.type === 'info') {
          console.log('ℹ️', data.message);
          
          // Extract API names from info messages
          if (data.message.includes('Hotel Search API')) {
            apiNamesFound.add('Hotel Search API');
          }
          if (data.message.includes('User Profile API')) {
            apiNamesFound.add('User Profile API');
          }
          if (data.message.includes('Payment Gateway')) {
            apiNamesFound.add('Payment Gateway');
          }
        }
        
        if (data.type === 'progress') {
          if (!progressFound) {
            console.log(`📊 Total test cases calculated: ${data.total}`);
            progressFound = true;
          }
        }
        
        if (data.type === 'result' && data.result) {
          const result = data.result;
          totalTests++;
          
          // Track tests by API
          if (!testsByAPI[result.apiName]) {
            testsByAPI[result.apiName] = 0;
          }
          testsByAPI[result.apiName]++;
          
          console.log(`\n📋 Test ${totalTests}:`);
          console.log(`   API: ${result.apiName}`);
          console.log(`   Test Case: ${result.testCase}`);
          console.log(`   Parameters: ${result.parameters}`);
          console.log(`   Response: ${result.response.substring(0, 50)}...`);
          console.log(`   Has cURL: ${!!result.curlCommand}`);
        }
      } catch {
        // Skip invalid JSON
      }
    }
    
    console.log(`\n📊 3-COLUMN FORMAT SUMMARY:`);
    console.log(`   - API Names in info messages: ${Array.from(apiNamesFound).join(', ')}`);
    console.log(`   - Total test results: ${totalTests}`);
    console.log(`   - Tests by API:`);
    Object.entries(testsByAPI).forEach(([api, count]) => {
      console.log(`     • ${api}: ${count} tests`);
    });
    console.log(`   - Expected: 35 tests total (Hotel:12, User:10, Payment:13)`);
    
    const expectedAPIs = ['Hotel Search API', 'User Profile API', 'Payment Gateway'];
    const allAPIsFound = expectedAPIs.every(api => apiNamesFound.has(api));
    const hasCorrectTotal = totalTests === 35;
    const hasCorrectDistribution = testsByAPI['Hotel Search API'] === 12 && 
                                  testsByAPI['User Profile API'] === 10 && 
                                  testsByAPI['Payment Gateway'] === 13;
    
    if (allAPIsFound && hasCorrectTotal && hasCorrectDistribution) {
      console.log('\n🎉 SUCCESS: 3-column format is working perfectly!');
      console.log('   ✅ All 3 APIs detected');
      console.log('   ✅ Correct total test count (35)');
      console.log('   ✅ Correct distribution per API');
      console.log('   ✅ API names shown in results');
    } else {
      console.log('\n❌ ISSUE: 3-column format needs fixes');
      console.log(`   APIs found: ${allAPIsFound ? '✅' : '❌'} (${Array.from(apiNamesFound).length}/3)`);
      console.log(`   Total tests: ${hasCorrectTotal ? '✅' : '❌'} (${totalTests}/35)`);
      console.log(`   Distribution: ${hasCorrectDistribution ? '✅' : '❌'}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

test3ColumnFormat();