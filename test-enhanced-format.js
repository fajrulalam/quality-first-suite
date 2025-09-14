const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testEnhancedFormat() {
  try {
    console.log('🧪 Testing ENHANCED format with custom field values...\n');
    
    const form = new FormData();
    form.append('file', fs.createReadStream('enhanced-custom-values-test.xlsx'));
    form.append('useProxy', 'true');
    form.append('sessionAccessToken', '');
    form.append('sessionRefreshToken', '');
    
    console.log('📤 Sending enhanced format test to API...');
    const response = await fetch('http://localhost:3002/api/api-test-cases/process', {
      method: 'POST',
      body: form
    });
    
    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      return;
    }
    
    console.log('✅ API responded, checking enhanced features...\n');
    
    const responseText = await response.text();
    const lines = responseText.split('\n').filter(line => line.trim());
    
    let apiNameFound = false;
    let testCaseFound = false;
    let customValueTests = 0;
    let emptyInvalidTests = 0;
    let totalTests = 0;
    let progressFound = false;
    
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        
        if (data.type === 'info' && data.message.includes('Hotel Search API')) {
          apiNameFound = true;
          console.log('✅ API Name found:', data.message);
        }
        
        if (data.type === 'info' && data.message.includes('Basic Search Test')) {
          testCaseFound = true;
          console.log('✅ Test Case found:', data.message);
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
          
          console.log(`\n📋 Test ${totalTests}: ${result.testCase}`);
          console.log(`   Parameters: ${result.parameters}`);
          console.log(`   Response: ${result.response.substring(0, 50)}...`);
          
          // Check for custom value tests
          if (result.testCase.includes('="') || result.testCase.includes('CITY') || 
              result.testCase.includes('REGION') || result.testCase.includes('AREA') ||
              result.testCase.includes('abt') || result.testCase.includes('aat')) {
            customValueTests++;
            console.log('   ✅ Custom value test detected');
          }
          
          // Check for empty/invalid tests
          if (result.testCase.includes('Empty') || result.testCase.includes('Invalid')) {
            emptyInvalidTests++;
            console.log('   ✅ Empty/Invalid test detected');
          }
        }
      } catch {
        // Skip invalid JSON
      }
    }
    
    console.log(`\n📊 ENHANCED FORMAT SUMMARY:`);
    console.log(`   - API Name detected: ${apiNameFound ? '✅ YES' : '❌ NO'}`);
    console.log(`   - Test Case detected: ${testCaseFound ? '✅ YES' : '❌ NO'}`);
    console.log(`   - Total test results: ${totalTests}`);
    console.log(`   - Custom value tests: ${customValueTests}`);
    console.log(`   - Empty/Invalid tests: ${emptyInvalidTests}`);
    console.log(`   - Expected total: 12 tests`);
    
    const success = apiNameFound && testCaseFound && totalTests === 12 && 
                   customValueTests >= 7 && emptyInvalidTests >= 5;
    
    if (success) {
      console.log('\n🎉 SUCCESS: Enhanced format with custom values is working!');
    } else {
      console.log('\n❌ ISSUE: Enhanced format needs fixes');
      console.log(`   Expected: API name ✓, Test case ✓, 12 total tests, 7+ custom, 5+ empty/invalid`);
      console.log(`   Got: API name ${apiNameFound}, Test case ${testCaseFound}, ${totalTests} total, ${customValueTests} custom, ${emptyInvalidTests} empty/invalid`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEnhancedFormat();