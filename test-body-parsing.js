// Test the current body parsing issue

function testCurrentBodyParsing(curlCommand) {
  console.log('Testing cURL:', curlCommand.substring(0, 100) + '...');
  
  // Clean up the command (same as actual implementation)
  let cmd = curlCommand
    .replace(/\\\s*\n\s*/g, ' ') // Remove line continuations
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/^curl\s+/i, '') // Remove curl command
    .trim();

  console.log('Cleaned command:', cmd.substring(0, 200) + '...');

  // Current problematic regex
  const dataMatch = cmd.match(/--data(?:-raw)?\s+['"]([^'"]+)['"]/i);
  
  if (dataMatch && dataMatch[1]) {
    console.log('❌ CURRENT REGEX EXTRACTED:', dataMatch[1]);
    console.log('   Length:', dataMatch[1].length);
    
    try {
      const parsed = JSON.parse(dataMatch[1]);
      console.log('   JSON parsing: SUCCESS');
      console.log('   Object keys:', Object.keys(parsed));
    } catch (e) {
      console.log('   JSON parsing: FAILED -', e.message);
    }
  } else {
    console.log('❌ NO MATCH FOUND');
  }
  
  console.log('\n--- Attempting Better Extraction ---');
  
  // Better approach - find the data flag and extract until the end quote, handling nested content
  const dataStartMatch = cmd.match(/(--data(?:-raw)?)\s+(['"])/i);
  if (dataStartMatch) {
    const quote = dataStartMatch[2];
    const flagEnd = dataStartMatch.index + dataStartMatch[0].length;
    const remaining = cmd.substring(flagEnd);
    
    // Find the matching closing quote, accounting for escapes
    let depth = 0;
    let inQuote = false;
    let bodyEnd = -1;
    
    for (let i = 0; i < remaining.length; i++) {
      const char = remaining[i];
      const prevChar = i > 0 ? remaining[i-1] : '';
      
      if (char === quote && prevChar !== '\\') {
        if (!inQuote) {
          inQuote = true;
        } else if (depth === 0) {
          bodyEnd = i;
          break;
        }
      } else if (inQuote) {
        if (char === '{' && prevChar !== '\\') depth++;
        if (char === '}' && prevChar !== '\\') depth--;
      }
    }
    
    if (bodyEnd > 0) {
      const bodyContent = remaining.substring(0, bodyEnd);
      console.log('✅ IMPROVED EXTRACTION:', bodyContent);
      console.log('   Length:', bodyContent.length);
      
      try {
        const parsed = JSON.parse(bodyContent);
        console.log('   JSON parsing: SUCCESS');
        console.log('   Object keys:', Object.keys(parsed));
      } catch (e) {
        console.log('   JSON parsing: FAILED -', e.message);
      }
    } else {
      console.log('❌ Could not find matching quote');
    }
  }
}

// Test cases
const testCases = [
  // Your actual problematic cURL
  `curl 'https://www.tiket.com/ms-gateway/tix-hotel-search/v3/search' -H 'content-type: text/plain;charset=UTF-8' --data-raw '{"accommodationType":"hotel","room":1,"adult":1,"childAges":[],"searchType":"CITY","searchValue":"surabaya-108001534490276270","taxDisplay":"abt","sort":"popularity","startDate":"2025-09-20","night":1,"page":1,"filter":{},"utmFclid":"","utmSource":"","groupFilterKeyword":""}'`,
  
  // Simpler test
  `curl -H 'content-type: application/json' --data '{"simple":"test"}' 'https://api.example.com'`,
  
  // With escaped quotes
  `curl --data-raw '{"message":"Hello \"world\"","value":123}' 'https://api.example.com'`
];

console.log('Testing body parsing issues...\n');

testCases.forEach((testCase, index) => {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TEST CASE ${index + 1}`);
  console.log('='.repeat(80));
  testCurrentBodyParsing(testCase);
});