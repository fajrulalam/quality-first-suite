const XLSX = require('xlsx');

// Create test data with your ACTUAL problematic cURL command
const data = [
  [
    `curl 'https://www.tiket.com/ms-gateway/tix-hotel-search/v3/search' \\
  -H 'accept: */*' \\
  -H 'accept-language: id' \\
  -H 'content-type: text/plain;charset=UTF-8' \\
  -H 'countrycode: IDN' \\
  -H 'currency: IDR' \\
  -H 'deviceid: 5f6b6634-4bbb-4012-97f8-6212c5047966' \\
  -H 'lang: id' \\
  -H 'origin: https://www.tiket.com' \\
  -H 'referer: https://www.tiket.com/hotel/search?room=1&adult=1&checkin=2025-09-20&checkout=2025-09-21' \\
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' \\
  -H 'x-audience: tiket.com' \\
  -H 'x-country-code: IDN' \\
  -H 'x-currency: IDR' \\
  --data-raw '{"accommodationType":"hotel","room":1,"adult":1,"childAges":[],"searchType":"CITY","searchValue":"surabaya-108001534490276270","taxDisplay":"abt","sort":"popularity","startDate":"2025-09-20","night":1,"page":1,"filter":{},"utmFclid":"","utmSource":"","groupFilterKeyword":""}'`,
    "room,adult,startDate"
  ]
];

// Create workbook
const ws = XLSX.utils.aoa_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "RealTiketTest");

// Write file
XLSX.writeFile(wb, 'real-tiket-body-test.xlsx');

console.log('✅ Created real-tiket-body-test.xlsx');
console.log('📋 This will test the FULL request body parsing fix');
console.log('🔍 Expected behavior:');
console.log('   - Should extract complete JSON body with all fields');
console.log('   - Should show fields: accommodationType, room, adult, childAges, searchType, etc.');
console.log('   - Should NOT show {"data":"{"} anymore');
console.log('   - Should properly test field variations for room, adult, startDate');