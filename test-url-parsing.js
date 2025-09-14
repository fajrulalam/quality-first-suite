// Test URL parsing logic with problematic cases

function parseCurlSimulated(curlCommand) {
  const result = {
    method: 'GET',
    url: '',
    headers: {},
    body: null,
    queryParams: {}
  };

  // Clean up the command
  let cmd = curlCommand
    .replace(/\\\s*\n\s*/g, ' ') // Remove line continuations
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/^curl\s+/i, '') // Remove curl command
    .trim();

  console.log('Cleaned cURL command:', cmd.substring(0, 200) + '...');

  // Extract method
  const methodMatch = cmd.match(/--request\s+(\w+)|--method\s+(\w+)|-X\s+(\w+)/i);
  if (methodMatch) {
    result.method = (methodMatch[1] || methodMatch[2] || methodMatch[3]).toUpperCase();
    cmd = cmd.replace(/--request\s+\w+|--method\s+\w+|-X\s+\w+/i, '').trim();
  } else if (cmd.includes('--data')) {
    result.method = 'POST';
  }

  // Extract URL first (look for --location, --url, or URLs at the end of command)
  const locationMatch = cmd.match(/--location\s+['"]([^'"]+)['"]/i) || 
                       cmd.match(/--url\s+['"]([^'"]+)['"]/i) ||
                       // Match URLs that are not part of header values (avoid matching "header: 'value with https://...'")
                       cmd.match(/(?:^|[^:]\s)['"]?(https?:\/\/[^\s'"]+)['"]?(?:\s*$)/i);
  
  if (locationMatch && locationMatch[1]) {
    const fullUrl = locationMatch[1];
    const [baseUrl, queryString] = fullUrl.split('?');
    result.url = baseUrl;
    
    if (queryString) {
      const params = new URLSearchParams(queryString);
      params.forEach((value, key) => {
        result.queryParams[key] = value;
      });
    }
    
    // Remove the matched URL from command
    cmd = cmd.replace(/--location\s+['"][^'"]+['"]/i, '').replace(/--url\s+['"][^'"]+['"]/i, '').trim();
  }

  // Extract headers
  const headerMatches = cmd.match(/--header\s+['"]([^'"]+)['"]|-H\s+['"]([^'"]+)['\"]/g);
  if (headerMatches) {
    headerMatches.forEach(match => {
      const headerContent = match.match(/--header\s+['"]([^'"]+)['"]|-H\s+['"]([^'"]+)['\"]/i);
      if (headerContent && (headerContent[1] || headerContent[2])) {
        const headerValue = headerContent[1] || headerContent[2];
        const colonIndex = headerValue.indexOf(':');
        if (colonIndex > 0) {
          const key = headerValue.substring(0, colonIndex).trim();
          const value = headerValue.substring(colonIndex + 1).trim();
          if (key && value) {
            result.headers[key] = value;
          }
        }
      }
    });
    cmd = cmd.replace(/--header\s+['"][^'"]+['"]|-H\s+['"][^'"]+['\"]/g, '').trim();
  }

  // If no URL found yet, try to extract from remaining command (avoid header values)
  if (!result.url) {
    // First try to find URL at the end of the command (most common cURL pattern)
    const endUrlMatch = cmd.match(/(?:^|[^:]\s+)['"]?(https?:\/\/[^\s'"]+)['"]?\s*$/i);
    // If not at end, look for any URL not preceded by a colon (to avoid header values)
    const anyUrlMatch = !endUrlMatch ? cmd.match(/(?:^|[^:]\s)(https?:\/\/[^\s'"]+)/i) : null;
    
    const urlMatch = endUrlMatch || anyUrlMatch;
    if (urlMatch) {
      const fullUrl = urlMatch[1];
      const [baseUrl, queryString] = fullUrl.split('?');
      result.url = baseUrl;
      
      if (queryString) {
        const params = new URLSearchParams(queryString);
        params.forEach((value, key) => {
          result.queryParams[key] = value;
        });
      }
    }
  }

  return result;
}

// Test cases
const testCases = [
  // Good case - should extract URL correctly
  `curl --location 'https://www.tiket.com/ms-gateway/tix-hotel-search/v3/search' --header 'accept: */*' --header 'content-type: text/plain;charset=UTF-8' --header 'countrycode: IDN' --data '{"accommodationType":"hotel","room":1}'`,
  
  // Problematic case - should NOT extract origin header as URL
  `curl --header 'accept: */*' --header 'origin: https://www.tiket.com' --header 'content-type: application/json' --data '{"test":1}' 'https://api.example.com/test'`,
  
  // Another problematic case
  `curl -H 'referer: https://badsite.com' -H 'origin: https://anotherbadsite.com' --data '{}' 'https://api.realsite.com/endpoint'`
];

console.log('Testing URL parsing fixes...\n');

testCases.forEach((testCase, index) => {
  console.log(`\n=== Test Case ${index + 1} ===`);
  console.log('Input cURL:', testCase.substring(0, 100) + '...');
  
  const result = parseCurlSimulated(testCase);
  
  console.log('Extracted URL:', result.url);
  console.log('Method:', result.method);
  console.log('Headers:', Object.keys(result.headers));
  
  if (result.url.includes('tiket.com') && index === 1) {
    console.log('❌ ERROR: Extracted origin header as URL!');
  } else if (result.url === 'https://www.tiket.com/ms-gateway/tix-hotel-search/v3/search' && index === 0) {
    console.log('✅ SUCCESS: Correctly extracted main URL');
  } else if (result.url === 'https://api.example.com/test' && index === 1) {
    console.log('✅ SUCCESS: Correctly extracted API URL, ignored origin header');
  } else if (result.url === 'https://api.realsite.com/endpoint' && index === 2) {
    console.log('✅ SUCCESS: Correctly extracted real API URL');
  } else {
    console.log('❓ Need to check:', result.url);
  }
});