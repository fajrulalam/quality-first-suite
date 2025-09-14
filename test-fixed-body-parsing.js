// Test the FIXED body parsing

function testFixedBodyParsing(curlCommand) {
  console.log('Testing cURL:', curlCommand.substring(0, 100) + '...');
  
  // Clean up the command (same as actual implementation)
  let cmd = curlCommand
    .replace(/\\\s*\n\s*/g, ' ') // Remove line continuations
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/^curl\s+/i, '') // Remove curl command
    .trim();

  console.log('Cleaned command length:', cmd.length);

  // NEW FIXED approach
  const dataFlagMatch = cmd.match(/(--data(?:-raw)?)\s+(['"])/i);
  
  if (dataFlagMatch) {
    const quote = dataFlagMatch[2];
    const flagEnd = dataFlagMatch.index + dataFlagMatch[0].length;
    const remaining = cmd.substring(flagEnd);
    
    console.log('Found data flag:', dataFlagMatch[1]);
    console.log('Quote type:', quote);
    console.log('Remaining after flag:', remaining.substring(0, 100) + '...');
    
    // Find the matching closing quote, handling escaped quotes
    let bodyEnd = -1;
    let escapeNext = false;
    
    for (let i = 0; i < remaining.length; i++) {
      const char = remaining[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if (char === quote) {
        bodyEnd = i;
        break;
      }
    }
    
    if (bodyEnd > 0) {
      const dataString = remaining.substring(0, bodyEnd);
      
      console.log('✅ EXTRACTED BODY:');
      console.log('   Length:', dataString.length);
      console.log('   Content:', dataString);
      
      try {
        const parsed = JSON.parse(dataString);
        console.log('   ✅ JSON parsing: SUCCESS');
        console.log('   Object keys:', Object.keys(parsed));
        console.log('   Sample values:', Object.entries(parsed).slice(0, 3));
        return parsed;
      } catch (e) {
        console.log('   ❌ JSON parsing failed:', e.message);
        return { data: dataString };
      }
    } else {
      console.log('❌ Could not find matching quote');
      return null;
    }
  } else {
    console.log('❌ No data flag found');
    return null;
  }
}

// Test cases
const testCases = [
  // Your actual problematic cURL (simplified for testing)
  `curl 'https://www.tiket.com/ms-gateway/tix-hotel-search/v3/search' --data-raw '{"accommodationType":"hotel","room":1,"adult":1,"childAges":[],"searchType":"CITY","searchValue":"surabaya-108001534490276270","taxDisplay":"abt","sort":"popularity","startDate":"2025-09-20","night":1,"page":1,"filter":{},"utmFclid":"","utmSource":"","groupFilterKeyword":""}'`,
  
  // Simpler test
  `curl --data '{"simple":"test","number":123}' 'https://api.example.com'`,
  
  // With escaped quotes  
  `curl --data-raw '{"message":"Hello world","nested":{"key":"value"},"array":[1,2,3]}' 'https://api.example.com'`
];

console.log('Testing FIXED body parsing...\n');

testCases.forEach((testCase, index) => {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TEST CASE ${index + 1}`);
  console.log('='.repeat(80));
  const result = testFixedBodyParsing(testCase);
  
  if (result && typeof result === 'object' && Object.keys(result).length > 0) {
    console.log('🎉 SUCCESS: Body properly parsed!');
  } else {
    console.log('💥 FAILED: Body not parsed correctly');
  }
});