# Excel File Example for Your Tiket.com API

## Create an Excel file (.xlsx) with these two columns:

### Column A (cURL Command):
```
curl --location 'https://www.tiket.com/ms-gateway/tix-hotel-search/v3/search' --header 'accept: */*' --header 'accept-language: id' --header 'content-type: text/plain;charset=UTF-8' --header 'countrycode: IDN' --header 'currency: IDR' --header 'deviceid: 5f6b6634-4bbb-4012-97f8-6212c5047966' --header 'lang: id' --header 'origin: https://www.tiket.com' --header 'priority: u=1, i' --header 'referer: https://www.tiket.com/hotel/search?room=1&adult=1&checkin=2025-09-18&checkout=2025-09-19&searchSessionId=75A41B7E-439E-4B84-8FCA-396272572233&type=CITY&q=Surabaya&id=surabaya-108001534490276270' --header 'sec-ch-ua: "Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"' --header 'sec-ch-ua-mobile: ?0' --header 'sec-ch-ua-platform: "macOS"' --header 'sec-fetch-dest: empty' --header 'sec-fetch-mode: cors' --header 'sec-fetch-site: same-origin' --header 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' --header 'utm-external: organic' --header 'utm-medium: none' --header 'utm-source: none' --header 'x-audience: tiket.com' --header 'x-cookie-session-v2: true' --header 'x-country-code: IDN' --header 'x-currency: IDR' --header 'x-request-id: 92a51964-7d48-42fd-82ad-771a6b381d42' --header 'x-search-session-id: 75A41B7E-439E-4B84-8FCA-396272572233' --header 'Cookie: [YOUR_ACTUAL_COOKIE_VALUES]' --data '{"accommodationType":"hotel","room":1,"adult":1,"childAges":[],"searchType":"CITY","searchValue":"surabaya-108001534490276270","taxDisplay":"abt","sort":"popularity","startDate":"2025-09-18","night":1,"page":1,"filter":{},"utmFclid":"","utmSource":"","groupFilterKeyword":""}'
```

### Column B (Fields to Test):
```
deviceid,currency,countrycode,startDate,adult,room,searchValue
```

## Instructions:

1. **Copy the cURL**: Copy your exact cURL command into cell A1 (single line, no line breaks)
2. **Specify fields**: Put the fields to test in cell B1 (comma-separated)
3. **Save as Excel**: Save the file as .xlsx format
4. **Upload**: Use the API Test Cases tool with **Proxy Server enabled**

## What will be tested:

The system will create test cases like:
- ✅ **Original request**: Valid values (should work)
- ❌ **Empty deviceid**: Test with deviceid=""
- ❌ **Invalid deviceid**: Test with deviceid="INVALID_12345"
- ❌ **Empty currency**: Test with currency=""
- ❌ **Invalid currency**: Test with currency="INVALID_XYZ"
- ❌ **Empty startDate**: Test with startDate=""
- ❌ **Invalid startDate**: Test with startDate="INVALID_DATE"
- And so on...

## Expected Results:

With the improved cURL parser and proxy server, you should now see:
- 🟢 **200 OK**: For valid requests
- 🔴 **400 Bad Request**: For invalid parameters
- 🟡 **Other codes**: Depending on API validation

The new cURL parser handles:
- ✅ Multiline cURL commands with backslashes
- ✅ Complex nested JSON in --data
- ✅ Multiple --header entries
- ✅ Automatic POST method detection
- ✅ Proper URL extraction from --location

Try it now and you should see proper HTTP responses instead of network errors!