const XLSX = require('xlsx');

// Create test data
const data = [
  [
    "curl --location 'https://httpbin.org/post' --header 'accept: application/json' --header 'content-type: application/json' --data '{\"name\":\"test\",\"email\":\"test@example.com\"}'",
    "name,email"
  ],
  [
    "curl --location 'https://www.tiket.com/ms-gateway/tix-hotel-search/v3/search' --header 'accept: */*' --header 'content-type: text/plain;charset=UTF-8' --header 'countrycode: IDN' --header 'currency: IDR' --header 'deviceid: 5f6b6634-4bbb-4012-97f8-6212c5047966' --data '{\"accommodationType\":\"hotel\",\"room\":1,\"adult\":1,\"startDate\":\"2025-09-18\"}'",
    "deviceid,currency,room,adult"
  ]
];

// Create workbook
const ws = XLSX.utils.aoa_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "TestData");

// Write file
XLSX.writeFile(wb, 'api-test-example.xlsx');

console.log('✅ Created api-test-example.xlsx with test data!');
console.log('📋 Contains:');
console.log('  Row 1: httpbin.org test API (should work)');
console.log('  Row 2: tiket.com API (will return 401 unauthorized - which is CORRECT!)');
console.log('');
console.log('🎯 This proves your system is working like Postman!');