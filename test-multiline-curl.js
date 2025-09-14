// Test multiline cURL parsing

function testMultilineCurl(curlCommand) {
  console.log('Original cURL:');
  console.log(curlCommand);
  console.log('\n=== Cleaning Process ===');
  
  // Step 1: Handle line continuations
  let step1 = curlCommand.replace(/\\\s*\n\s*/g, ' ');
  console.log('After line continuation removal:');
  console.log(step1);
  
  // Step 2: Normalize whitespace
  let step2 = step1.replace(/\s+/g, ' ');
  console.log('\nAfter whitespace normalization:');
  console.log(step2);
  
  // Step 3: Remove curl command
  let step3 = step2.replace(/^curl\s+/i, '').trim();
  console.log('\nAfter curl removal:');
  console.log(step3);
  
  // Test URL extraction
  console.log('\n=== URL Extraction ===');
  
  const locationMatch = step3.match(/--location\s+['"]([^'"]+)['"]/i) || 
                       step3.match(/--url\s+['"]([^'"]+)['"]/i) ||
                       step3.match(/(?:^|[^:]\s)['"]?(https?:\/\/[^\s'"]+)['"]?(?:\s*$)/i);
  
  if (locationMatch) {
    console.log('Found URL:', locationMatch[1]);
  } else {
    console.log('No URL found with primary patterns');
    
    // Try fallback patterns
    const endUrlMatch = step3.match(/(?:^|[^:]\s+)['"]?(https?:\/\/[^\s'"]+)['"]?\s*$/i);
    const anyUrlMatch = !endUrlMatch ? step3.match(/(?:^|[^:]\s)(https?:\/\/[^\s'"]+)/i) : null;
    
    if (endUrlMatch) {
      console.log('Found URL with end pattern:', endUrlMatch[1]);
    } else if (anyUrlMatch) {
      console.log('Found URL with any pattern:', anyUrlMatch[1]);
    } else {
      console.log('❌ No URL found with any pattern');
    }
  }
}

// Test cases
const testCases = [
  // Case 1: Simple line continuation
  `curl 'https://www.tiket.com/ms-gateway/tix-hotel-search/v3/search' \\
-H 'accept: */*' \\
-H 'accept-language: id'`,

  // Case 2: Line continuation with spaces
  `curl 'https://www.tiket.com/ms-gateway/tix-hotel-search/v3/search' \\ 
-H 'accept: */*' \\ 
-H 'accept-language: id'`,

  // Case 3: Different line ending style
  `curl 'https://www.tiket.com/ms-gateway/tix-hotel-search/v3/search' \\
  -H 'accept: */*' \\
  -H 'accept-language: id'`
];

console.log('Testing multiline cURL parsing...\n');

testCases.forEach((testCase, index) => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`TEST CASE ${index + 1}`);
  console.log('='.repeat(50));
  testMultilineCurl(testCase);
});