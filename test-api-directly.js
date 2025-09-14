const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🧪 Testing API with problematic cURL commands...\n');
    
    const form = new FormData();
    form.append('file', fs.createReadStream('problematic-url-test.xlsx'));
    form.append('useProxy', 'true');
    form.append('sessionAccessToken', '');
    form.append('sessionRefreshToken', '');
    
    console.log('📤 Sending request to API...');
    const response = await fetch('http://localhost:3002/api/api-test-cases/process', {
      method: 'POST',
      body: form
    });
    
    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      return;
    }
    
    console.log('✅ API responded, processing stream...\n');
    
    const reader = response.body.getReader();
    let messageCount = 0;
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          messageCount++;
          
          console.log(`[${messageCount}] ${data.type.toUpperCase()}:`, 
            data.message || data.result?.testCase || `Progress: ${data.current}/${data.total}`);
          
          // Look for URL-related messages
          if (data.message && (data.message.includes('https://') || data.message.includes('URL:'))) {
            console.log('🔍 URL-RELATED:', data.message);
          }
          
          // Check for malformed URL errors
          if (data.message && (data.message.includes('origin:') || data.message.includes('unknown scheme'))) {
            console.log('❌ MALFORMED URL DETECTED:', data.message);
          }
          
        } catch {
          // Skip invalid JSON
        }
      }
    }
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Check if node-fetch is available
try {
  require('node-fetch');
  require('form-data');
  testAPI();
} catch (e) {
  console.log('⚠️ Missing dependencies. Installing...');
  console.log('Run: npm install node-fetch@2 form-data');
  console.log('Then run this script again.');
}