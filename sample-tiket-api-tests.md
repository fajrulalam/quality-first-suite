# Sample Excel File for Tiket.com API Testing

## Excel Format (save as .xlsx)

| Column A (cURL Command) | Column B (Fields to Test) |
|------------------------|---------------------------|
| `curl --location 'https://www.tiket.com/ms-gateway/tix-hotel-search/v3/search' --header 'accept: */*' --header 'accept-language: en-US,en;q=0.9' --header 'authorization: Bearer YOUR_TOKEN' --header 'content-type: application/json' --data '{"checkInDate":"2025-01-15","checkOutDate":"2025-01-16","cityId":"6","rooms":[{"adult":2,"child":0}],"sort":"price"}'` | `authorization,cityId,checkInDate,checkOutDate` |
| `curl --location 'https://api.tiket.com/search/flight?from=CGK&to=DPS&date=2025-01-15&adult=1' --header 'accept: application/json' --header 'x-api-key: YOUR_API_KEY'` | `x-api-key,from,to,adult` |

## How to Use

1. **Create Excel File**: Copy the table above into Excel and save as .xlsx
2. **Replace Tokens**: Replace `YOUR_TOKEN` and `YOUR_API_KEY` with real values
3. **Upload**: Use the API Test Cases tool to upload your file
4. **Enable Proxy**: Make sure "Use Proxy Server" is checked (recommended for all external APIs)

## What Will Be Tested

The system will automatically generate test cases like:
- Empty authorization header
- Invalid authorization header  
- Empty cityId
- Invalid cityId
- Empty checkInDate
- Invalid checkInDate
- etc.

## Expected Results

With the **Proxy Server enabled**, you should now get proper HTTP responses instead of CORS errors:
- ✅ 200/201 for successful requests
- ❌ 400/401/403/404 for validation errors
- 🟡 500+ for server errors

## Proxy Server Benefits

✅ **Bypasses CORS**: Works with any API including tiket.com  
✅ **Real Testing**: Get actual HTTP responses  
✅ **No Browser Limitations**: Server-side requests  
✅ **Better Error Messages**: Detailed response information  

The proxy server runs on your local Next.js application and forwards requests to the target APIs, eliminating CORS restrictions completely.