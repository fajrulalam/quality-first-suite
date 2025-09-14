const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testUIImprovements() {
  try {
    console.log('🧪 Testing UI improvements with cleaner logs and better formatting...\n');
    
    const form = new FormData();
    form.append('file', fs.createReadStream('real-tiket-body-test.xlsx'));
    form.append('useProxy', 'true');
    form.append('sessionAccessToken', '');
    form.append('sessionRefreshToken', '');
    
    console.log('📤 Sending test to API...');
    const response = await fetch('http://localhost:3002/api/api-test-cases/process', {
      method: 'POST',
      body: form
    });
    
    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      return;
    }
    
    console.log('✅ API responded, checking improvements...\n');
    
    const responseText = await response.text();
    const lines = responseText.split('\n').filter(line => line.trim());
    
    let cleanNotificationCount = 0;
    let verboseLogCount = 0;
    let testResultsFound = 0;
    let properResponseFormat = 0;
    let curlCommandsFound = 0;
    let parametersFilteredCorrectly = 0;
    
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        
        if (data.type === 'info') {
          cleanNotificationCount++;
          console.log('ℹ️ Clean notification:', data.message);
          
          // Check if we still have verbose cURL logs (we shouldn't)
          if (data.message.includes('📋') || data.message.includes('copy to Postman')) {
            verboseLogCount++;
            console.log('❌ Found verbose log:', data.message.substring(0, 100));
          }
        }
        
        if (data.type === 'result' && data.result) {
          const result = data.result;
          testResultsFound++;
          
          console.log(`\n📊 Test Result ${testResultsFound}:`);
          console.log(`   Test Case: ${result.testCase}`);
          console.log(`   Parameters: ${result.parameters}`);
          console.log(`   Response: ${result.response}`);
          console.log(`   Has cURL: ${!!result.curlCommand}`);
          
          // Check response format
          if (result.response && result.response.match(/^\(code:[^,]+,message:[^)]+\)$/)) {
            properResponseFormat++;
            console.log('   ✅ Response format correct');
          } else {
            console.log('   ❌ Response format incorrect:', result.response);
          }
          
          // Check cURL command presence
          if (result.curlCommand && result.curlCommand.length > 100) {
            curlCommandsFound++;
            console.log('   ✅ cURL command present (length:', result.curlCommand.length + ')');
          } else {
            console.log('   ❌ cURL command missing or too short');
          }
          
          // Check parameters filtering (should only contain the fields from Excel column 2)
          if (result.parameters && result.parameters.includes('room:') && result.parameters.includes('adult:') && result.parameters.includes('startDate:')) {
            // Check if it DOESN'T contain unrelated fields
            if (!result.parameters.includes('deviceid:') && !result.parameters.includes('lang:')) {
              parametersFilteredCorrectly++;
              console.log('   ✅ Parameters correctly filtered to test fields only');
            } else {
              console.log('   ❌ Parameters still contain non-test fields');
            }
          }
        }
      } catch {
        // Skip invalid JSON
      }
    }
    
    console.log(`\n📊 IMPROVEMENTS SUMMARY:`);
    console.log(`   - Clean notifications: ${cleanNotificationCount}`);
    console.log(`   - Verbose logs removed: ${verboseLogCount === 0 ? '✅ YES' : '❌ NO (' + verboseLogCount + ' found)'}`);
    console.log(`   - Test results found: ${testResultsFound}`);
    console.log(`   - Proper response format: ${properResponseFormat}/${testResultsFound} ${properResponseFormat === testResultsFound ? '✅' : '❌'}`);
    console.log(`   - cURL commands included: ${curlCommandsFound}/${testResultsFound} ${curlCommandsFound === testResultsFound ? '✅' : '❌'}`);
    console.log(`   - Parameters filtered correctly: ${parametersFilteredCorrectly}/${testResultsFound} ${parametersFilteredCorrectly === testResultsFound ? '✅' : '❌'}`);
    
    const allImprovementsWork = verboseLogCount === 0 && 
                               properResponseFormat === testResultsFound && 
                               curlCommandsFound === testResultsFound && 
                               parametersFilteredCorrectly === testResultsFound;
    
    if (allImprovementsWork) {
      console.log('\n🎉 SUCCESS: All UI improvements are working!');
    } else {
      console.log('\n❌ ISSUE: Some improvements need fixes');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUIImprovements();