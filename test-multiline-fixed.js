// Test the fixed multiline cURL parsing

function testFixedMultilineCurl(curlCommand) {
  console.log('Original cURL:');
  console.log(curlCommand);
  console.log('\n=== Cleaning Process ===');
  
  // Clean the command (same as actual implementation)
  let cmd = curlCommand
    .replace(/\\\s*\n\s*/g, ' ') // Remove line continuations
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/^curl\s+/i, '') // Remove curl command
    .trim();
  
  console.log('Cleaned command:', cmd);
  
  // Test new URL extraction logic
  console.log('\n=== URL Extraction ===');
  
  const locationMatch = cmd.match(/--location\s+['"]([^'"]+)['"]/i) || 
                       cmd.match(/--url\s+['"]([^'"]+)['"]/i) ||
                       // NEW: Match URLs at the beginning of command (common after curl removal)
                       cmd.match(/^['"]?(https?:\/\/[^\s'"]+)['"]?/i) ||
                       // Match URLs that are not part of header values
                       cmd.match(/(?:^|[^:]\s)['"]?(https?:\/\/[^\s'"]+)['"]?(?:\s*$)/i);
  
  if (locationMatch && locationMatch[1]) {
    console.log('✅ Found URL:', locationMatch[1]);
    return locationMatch[1];
  }
  
  // Try fallback patterns
  const beginningUrlMatch = cmd.match(/^['"]?(https?:\/\/[^\s'"]+)['"]?/i);
  const endUrlMatch = !beginningUrlMatch ? cmd.match(/(?:^|[^:]\s+)['"]?(https?:\/\/[^\s'"]+)['"]?\s*$/i) : null;
  const anyUrlMatch = !beginningUrlMatch && !endUrlMatch ? cmd.match(/(?:^|[^:]\s)(https?:\/\/[^\s'"]+)/i) : null;
  
  const urlMatch = beginningUrlMatch || endUrlMatch || anyUrlMatch;
  if (urlMatch) {
    console.log('✅ Found URL with fallback:', urlMatch[1]);
    return urlMatch[1];
  } else {
    console.log('❌ No URL found');
    return null;
  }
}

// Test cases that were failing
const testCases = [
  // Case 1: Simple line continuation
  `curl 'https://www.tiket.com/ms-gateway/tix-hotel-search/v3/search' \\
-H 'accept: */*' \\
-H 'accept-language: id'`,

  // Case 2: Line continuation with spaces
  `curl 'https://www.tiket.com/ms-gateway/tix-hotel-search/v3/search' \\ 
-H 'accept: */*' \\ 
-H 'accept-language: id'`,

  // Case 3: Without quotes
  `curl https://www.tiket.com/ms-gateway/tix-hotel-search/v3/search \\
-H 'accept: */*' \\
-H 'accept-language: id'`,

  // Case 4: With --location flag
  `curl --location 'https://www.tiket.com/ms-gateway/tix-hotel-search/v3/search' \\
-H 'accept: */*'`
];

console.log('Testing FIXED multiline cURL parsing...\n');

testCases.forEach((testCase, index) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST CASE ${index + 1}`);
  console.log('='.repeat(60));
  const url = testFixedMultilineCurl(testCase);
  if (url === 'https://www.tiket.com/ms-gateway/tix-hotel-search/v3/search') {
    console.log('🎉 SUCCESS: Extracted correct URL!');
  } else if (url) {
    console.log('❓ Got URL but not expected:', url);
  } else {
    console.log('💥 FAILED: No URL extracted');
  }
});