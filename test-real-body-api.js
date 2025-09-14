const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testRealBodyAPI() {
  try {
    console.log('🧪 Testing REAL tiket cURL with FULL request body...\n');
    
    const form = new FormData();
    form.append('file', fs.createReadStream('real-tiket-body-test.xlsx'));
    form.append('useProxy', 'true');
    form.append('sessionAccessToken', '');
    form.append('sessionRefreshToken', '');
    
    console.log('📤 Sending real tiket cURL test to API...');
    const response = await fetch('http://localhost:3002/api/api-test-cases/process', {
      method: 'POST',
      body: form
    });
    
    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      return;
    }
    
    console.log('✅ API responded, processing stream...\n');
    
    // Since node-fetch doesn't have getReader, let's use text()
    const responseText = await response.text();
    const lines = responseText.split('\n').filter(line => line.trim());
    
    let foundFullBody = false;
    let foundCorrectFields = false;
    let errorCount = 0;
    
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        
        if (data.type === 'error') {
          console.log('❌ ERROR:', data.message);
          errorCount++;
        } else if (data.type === 'info' && data.message.includes('ORIGINAL cURL')) {
          console.log('📋 Found original cURL reconstruction');
        } else if (data.type === 'info' && data.message.includes('--data')) {
          const curlLine = data.message;
          console.log('🔍 Body check:', curlLine.substring(0, 200) + '...');
          
          // Check if it contains the full body (not just {"data":"{"})
          if (curlLine.includes('accommodationType') && curlLine.includes('searchValue')) {
            console.log('✅ SUCCESS: Full request body found in cURL!');
            foundFullBody = true;
          } else if (curlLine.includes('{"data":"{')) {
            console.log('❌ STILL BROKEN: Only partial body {"data":"{"');
          }
        } else if (data.result && data.result.parameters) {
          const params = data.result.parameters;
          console.log('📊 Test result params:', params.substring(0, 150) + '...');
          
          // Check if parameters include the expected fields
          if (params.includes('accommodationType:hotel') && params.includes('searchValue:surabaya')) {
            console.log('✅ SUCCESS: Parameters contain full field data!');
            foundCorrectFields = true;
          }
        }
      } catch {
        // Skip invalid JSON
      }
    }
    
    console.log(`\n📊 Results:`);
    console.log(`   - Found full body in cURL: ${foundFullBody ? '✅ YES' : '❌ NO'}`);
    console.log(`   - Found correct fields: ${foundCorrectFields ? '✅ YES' : '❌ NO'}`);
    console.log(`   - Error count: ${errorCount}`);
    
    if (foundFullBody && foundCorrectFields && errorCount === 0) {
      console.log('🎉 SUCCESS: Request body parsing is FIXED!');
    } else {
      console.log('❌ ISSUE: Still having problems with request body parsing');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRealBodyAPI();