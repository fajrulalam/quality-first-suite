const XLSX = require('xlsx');

// Create test data with the CORRECT 3-column format: API Name, cURL, Variables
const data = [
  [
    "API Name", 
    "cURL", 
    "Variables"
  ],
  [
    "Hotel Search API",
    `curl 'https://www.tiket.com/ms-gateway/tix-hotel-search/v3/search' \\
  -H 'accept: */*' \\
  -H 'accept-language: id' \\
  -H 'content-type: text/plain;charset=UTF-8' \\
  -H 'countrycode: IDN' \\
  --data-raw '{"accommodationType":"hotel","room":1,"adult":1,"searchType":"CITY","searchValue":"surabaya-108001534490276270","taxDisplay":"abt","startDate":"2025-09-20"}'`,
    'searchType("CITY","REGION","AREA"),adult(1,2,10),taxDisplay("abt","aat")'
  ],
  [
    "User Profile API",
    `curl 'https://api.example.com/user/profile' \\
  -H 'Authorization: Bearer token123' \\
  -H 'Content-Type: application/json' \\
  --data '{"userId":123,"role":"user","status":"active"}'`,
    'role("admin","user","guest"),status("active","inactive","pending")'
  ],
  [
    "Payment Gateway",
    `curl 'https://payment.api.com/v1/charge' \\
  -H 'Authorization: Bearer payment-token' \\
  --data '{"amount":100,"currency":"USD","method":"card"}'`,
    'currency("USD","EUR","IDR"),amount(10,100,1000),method("card","bank","wallet")'
  ]
];

// Create workbook
const ws = XLSX.utils.aoa_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "3-Column Format");

// Set column widths
ws['!cols'] = [
  { wch: 25 }, // API Name
  { wch: 80 }, // cURL Command
  { wch: 70 }  // Variables
];

// Write file
XLSX.writeFile(wb, 'correct-3-column-test.xlsx');

console.log('✅ Created correct-3-column-test.xlsx');
console.log('📋 This demonstrates the CORRECT 3-column format:');
console.log('');
console.log('🔍 Expected Results:');
console.log('   📊 Hotel Search API: 3+3+2+2+2 = 12 test cases');
console.log('      - searchType: "CITY", "REGION", "AREA", Empty, Invalid');  
console.log('      - adult: 1, 2, 10, Empty, Invalid');
console.log('      - taxDisplay: "abt", "aat", Empty, Invalid');
console.log('');
console.log('   📊 User Profile API: 3+3+2+2 = 10 test cases');
console.log('      - role: "admin", "user", "guest", Empty, Invalid');
console.log('      - status: "active", "inactive", "pending", Empty, Invalid');
console.log('');
console.log('   📊 Payment Gateway: 3+3+3+2+2 = 13 test cases');
console.log('      - currency: "USD", "EUR", "IDR", Empty, Invalid');
console.log('      - amount: 10, 100, 1000, Empty, Invalid');  
console.log('      - method: "card", "bank", "wallet", Empty, Invalid');
console.log('');
console.log('   🎯 Total Expected: 35 comprehensive test cases across 3 APIs');
console.log('   📤 Output will show API Name in first column of results table');