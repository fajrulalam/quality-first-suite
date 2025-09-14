const XLSX = require('xlsx');

// Create test data with the NEW 4-column format and custom values
const data = [
  [
    "API Name", 
    "Test Case", 
    "cURL Command", 
    "Variables"
  ],
  [
    "Hotel Search API",
    "Basic Search Test",
    `curl 'https://www.tiket.com/ms-gateway/tix-hotel-search/v3/search' \\
  -H 'accept: */*' \\
  -H 'accept-language: id' \\
  -H 'content-type: text/plain;charset=UTF-8' \\
  -H 'countrycode: IDN' \\
  --data-raw '{"accommodationType":"hotel","room":1,"adult":1,"searchType":"CITY","searchValue":"surabaya-108001534490276270","taxDisplay":"abt","startDate":"2025-09-20"}'`,
    'searchType("CITY","REGION","AREA"),adult(1,2,10),taxDisplay("abt","aat")'
  ]
];

// Create workbook
const ws = XLSX.utils.aoa_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Enhanced Tests");

// Set column widths
ws['!cols'] = [
  { wch: 20 }, // API Name
  { wch: 25 }, // Test Case
  { wch: 80 }, // cURL Command
  { wch: 60 }  // Variables
];

// Write file
XLSX.writeFile(wb, 'enhanced-custom-values-test.xlsx');

console.log('✅ Created enhanced-custom-values-test.xlsx');
console.log('📋 This will test the NEW format with custom field values');
console.log('🔍 Expected behavior:');
console.log('   - API Name: Hotel Search API');
console.log('   - Test Case: Basic Search Test');
console.log('   - searchType tests: "CITY", "REGION", "AREA", Empty, Invalid');
console.log('   - adult tests: 1, 2, 10, Empty, Invalid');
console.log('   - taxDisplay tests: "abt", "aat", Empty, Invalid');
console.log('   - Total test cases: 12 (3+2 + 3+2 + 2+2)');