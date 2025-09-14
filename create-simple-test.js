const XLSX = require('xlsx');

// Create test data with a simple cURL (no cookies) to test session token injection
const data = [
  [
    "curl --location 'https://www.tiket.com/ms-gateway/tix-hotel-search/v3/search' --header 'accept: */*' --header 'content-type: text/plain;charset=UTF-8' --header 'countrycode: IDN' --data '{\"accommodationType\":\"hotel\",\"room\":1}'",
    "countrycode,room"
  ]
];

// Create workbook
const ws = XLSX.utils.aoa_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "TestData");

// Write file
XLSX.writeFile(wb, 'simple-test.xlsx');

console.log('✅ Created simple-test.xlsx - this will test session token injection!');