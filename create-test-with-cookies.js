const XLSX = require('xlsx');

// Create test data with a proper cURL command that includes Cookie headers
const data = [
  [
    "curl --location 'https://www.tiket.com/ms-gateway/tix-hotel-search/v3/search' --header 'accept: */*' --header 'accept-language: id' --header 'content-type: text/plain;charset=UTF-8' --header 'countrycode: IDN' --header 'currency: IDR' --header 'deviceid: 5f6b6634-4bbb-4012-97f8-6212c5047966' --header 'Cookie: _gcl_au=1.1.123456789.1234567890; _ga=GA1.2.123456789.1234567890; tiket_session=test_session_token_123; user_token=test_user_token_456' --header 'Authorization: Bearer test_bearer_token_789' --data '{\"accommodationType\":\"hotel\",\"room\":1,\"adult\":1,\"startDate\":\"2025-09-18\"}'",
    "deviceid,currency,room,adult"
  ]
];

// Create workbook
const ws = XLSX.utils.aoa_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "TestData");

// Write file
XLSX.writeFile(wb, 'tiket-with-auth-test.xlsx');

console.log('✅ Created tiket-with-auth-test.xlsx with Cookie and Authorization headers!');
console.log('📋 This will test if your system preserves authentication headers correctly.');