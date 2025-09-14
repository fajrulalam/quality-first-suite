const XLSX = require('xlsx');

// Create test data with multiline cURL commands (with backslashes and line breaks)
const data = [
  [
    `curl 'https://www.tiket.com/ms-gateway/tix-hotel-search/v3/search' \\
-H 'accept: */*' \\
-H 'accept-language: id' \\
-H 'content-type: application/json' \\
--data '{"accommodationType":"hotel","room":1}'`,
    "room,accommodationType"
  ],
  [
    `curl --location 'https://api.example.com/test' \\
  -H 'accept: application/json' \\
  -H 'authorization: Bearer token123' \\
  --data '{"testField":"value"}'`,
    "testField"
  ]
];

// Create workbook
const ws = XLSX.utils.aoa_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "MultilineTests");

// Write file
XLSX.writeFile(wb, 'multiline-curl-test.xlsx');

console.log('✅ Created multiline-curl-test.xlsx');
console.log('📋 This will test multiline cURL parsing with backslash continuations');
console.log('🔍 Expected behavior:');
console.log('   - Row 1 should extract: https://www.tiket.com/ms-gateway/tix-hotel-search/v3/search');
console.log('   - Row 2 should extract: https://api.example.com/test');
console.log('   - Should NOT show "Failed to parse cURL command" errors');