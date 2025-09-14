const XLSX = require('xlsx');

// Create comprehensive example with multiple test cases showing the new format
const data = [
  [
    "API Name", 
    "Test Case", 
    "cURL Command", 
    "Variables"
  ],
  [
    "Hotel Search API",
    "Location Search Test",
    `curl 'https://www.tiket.com/ms-gateway/tix-hotel-search/v3/search' \\
  -H 'accept: */*' \\
  -H 'content-type: text/plain;charset=UTF-8' \\
  --data-raw '{"accommodationType":"hotel","room":1,"adult":1,"searchType":"CITY","searchValue":"surabaya","taxDisplay":"abt","startDate":"2025-09-20"}'`,
    'searchType("CITY","REGION","AREA"),adult(1,2,5),taxDisplay("abt","aat")'
  ],
  [
    "User Profile API", 
    "Authentication Test",
    `curl 'https://api.example.com/user/profile' \\
  -H 'Authorization: Bearer token123' \\
  -H 'Content-Type: application/json' \\
  --data '{"userId":123,"role":"user","status":"active"}'`,
    'role("admin","user","guest"),status("active","inactive","pending")'
  ],
  [
    "Payment Gateway",
    "Transaction Processing",
    `curl 'https://payment.api.com/v1/charge' \\
  -H 'Authorization: Bearer payment-token' \\
  --data '{"amount":100,"currency":"USD","method":"card"}'`,
    'currency("USD","EUR","IDR"),amount(10,100,1000),method("card","bank","wallet")'
  ]
];

// Create workbook
const ws = XLSX.utils.aoa_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Comprehensive Example");

// Set column widths
ws['!cols'] = [
  { wch: 25 }, // API Name
  { wch: 30 }, // Test Case  
  { wch: 80 }, // cURL Command
  { wch: 70 }  // Variables
];

// Write file
XLSX.writeFile(wb, 'comprehensive-custom-test-example.xlsx');

console.log('✅ Created comprehensive-custom-test-example.xlsx');
console.log('📋 This demonstrates the full NEW format capabilities:');
console.log('');
console.log('🔍 Expected Results:');
console.log('   📊 Hotel Search API: 3+3+2+2+2 = 12 test cases');
console.log('      - searchType: "CITY", "REGION", "AREA", Empty, Invalid');  
console.log('      - adult: 1, 2, 5, Empty, Invalid');
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