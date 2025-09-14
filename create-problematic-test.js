const XLSX = require('xlsx');

// Create test data with cURL that previously caused "origin: https://www.tiket.com" URL issues
const data = [
  [
    // This cURL has origin header that might have been incorrectly parsed as URL
    "curl --header 'accept: */*' --header 'accept-language: id' --header 'origin: https://www.tiket.com' --header 'referer: https://www.tiket.com/hotel' --header 'content-type: application/json' --data '{\"accommodationType\":\"hotel\",\"room\":1}' 'https://www.tiket.com/ms-gateway/tix-hotel-search/v3/search'",
    "room,accommodationType"
  ],
  [
    // Another case with multiple header URLs
    "curl -H 'user-agent: Mozilla/5.0' -H 'origin: https://badsite.com' -H 'referer: https://anotherbadsite.com' --data '{\"test\":\"value\"}' 'https://api.example.com/endpoint'",
    "test"
  ]
];

// Create workbook
const ws = XLSX.utils.aoa_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "ProblematicTests");

// Write file
XLSX.writeFile(wb, 'problematic-url-test.xlsx');

console.log('✅ Created problematic-url-test.xlsx');
console.log('📋 This will test that origin/referer headers are NOT extracted as URLs');
console.log('🔍 Expected behavior:');
console.log('   - Row 1 should use: https://www.tiket.com/ms-gateway/tix-hotel-search/v3/search');
console.log('   - Row 2 should use: https://api.example.com/endpoint');
console.log('   - Should NOT use: https://www.tiket.com, https://badsite.com, or https://anotherbadsite.com');