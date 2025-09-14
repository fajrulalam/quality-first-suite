const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testMultilineAPI() {
  try {
    console.log('🧪 Testing multiline cURL parsing with API...\n');
    
    const form = new FormData();
    form.append('file', fs.createReadStream('multiline-curl-test.xlsx'));
    form.append('useProxy', 'true');
    form.append('sessionAccessToken', '');
    form.append('sessionRefreshToken', '');
    
    console.log('📤 Sending multiline cURL test to API...');
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
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        
        if (data.type === 'error' && data.message.includes('Failed to parse cURL')) {
          console.log('❌ PARSE ERROR:', data.message);
          errorCount++;
        } else if (data.type === 'info' && data.message.includes('Validating cURL')) {
          console.log('✅ SUCCESS:', data.message);
          successCount++;
        } else if (data.message && data.message.includes('https://')) {
          console.log('🔍 URL-related:', data.message.substring(0, 100) + '...');
        }
      } catch {
        // Skip invalid JSON
      }
    }
    
    console.log(`\n📊 Results: ${successCount} successful parses, ${errorCount} parse errors`);
    
    if (errorCount === 0 && successCount >= 2) {
      console.log('🎉 SUCCESS: Multiline cURL parsing is working!');
    } else {
      console.log('❌ ISSUE: Still having parsing problems');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMultilineAPI();