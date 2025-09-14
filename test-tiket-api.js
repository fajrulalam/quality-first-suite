// Test the tiket.com API directly
const fetch = require('node-fetch');

async function testTiketAPI() {
  const proxyRequest = {
    url: 'https://www.tiket.com/ms-gateway/tix-hotel-search/v3/search',
    method: 'POST',
    headers: {
      'accept': '*/*',
      'accept-language': 'id',
      'content-type': 'text/plain;charset=UTF-8',
      'countrycode': 'IDN',
      'currency': 'IDR',
      'deviceid': '5f6b6634-4bbb-4012-97f8-6212c5047966',
      'lang': 'id',
      'origin': 'https://www.tiket.com',
      'priority': 'u=1, i',
      'referer': 'https://www.tiket.com/hotel/search?room=1&adult=1&checkin=2025-09-18&checkout=2025-09-19&searchSessionId=75A41B7E-439E-4B84-8FCA-396272572233&type=CITY&q=Surabaya&id=surabaya-108001534490276270',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      'utm-external': 'organic',
      'utm-medium': 'none',
      'utm-source': 'none',
      'x-audience': 'tiket.com',
      'x-cookie-session-v2': 'true',
      'x-country-code': 'IDN',
      'x-currency': 'IDR',
      'x-request-id': '92a51964-7d48-42fd-82ad-771a6b381d42',
      'x-search-session-id': '75A41B7E-439E-4B84-8FCA-396272572233'
    },
    body: {
      "accommodationType": "hotel",
      "room": 1,
      "adult": 1,
      "childAges": [],
      "searchType": "CITY",
      "searchValue": "surabaya-108001534490276270",
      "taxDisplay": "abt",
      "sort": "popularity",
      "startDate": "2025-09-18",
      "night": 1,
      "page": 1,
      "filter": {},
      "utmFclid": "",
      "utmSource": "",
      "groupFilterKeyword": ""
    }
  };

  try {
    console.log('Testing tiket.com API through our proxy...');
    
    const response = await fetch('http://localhost:3001/api/api-test-cases/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(proxyRequest),
    });

    const result = await response.json();
    
    console.log('Response Status:', result.status);
    console.log('Response OK:', result.ok);
    console.log('Response Headers:', Object.keys(result.headers));
    console.log('Response Data Length:', result.data ? result.data.length : 0);
    
    if (result.data) {
      try {
        const jsonData = JSON.parse(result.data);
        console.log('Parsed JSON Keys:', Object.keys(jsonData));
      } catch {
        console.log('Response Data (first 200 chars):', result.data.substring(0, 200));
      }
    }

    if (result.error) {
      console.log('Error:', result.error);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testTiketAPI();