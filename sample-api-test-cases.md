# Sample Excel File Format for API Test Cases

## Excel File Structure

The Excel file should contain two columns:

### Column A: cURL Command
Contains the complete cURL command with valid field values.

### Column B: Fields to Test
Comma-separated list of fields that should be tested with empty and invalid values.

## Sample Data

| cURL Command | Fields to Test |
|--------------|----------------|
| `curl -X POST "https://api.example.com/login" -H "X-Service-ID: service123" -H "Content-Type: application/json" --data '{"username":"testuser","password":"testpass","city":"Jakarta","startDate":"2025-09-30"}'` | `X-Service-ID,username,password,city` |
| `curl -X GET "https://api.example.com/hotels?currency=IDR&location=Jakarta" -H "Authorization: Bearer token123" -H "X-Client-ID: client456"` | `currency,location,Authorization,X-Client-ID` |

## How it Works

1. **Upload Excel File**: The system reads the Excel file with the above format
2. **Validate Original cURL**: Each cURL is executed to ensure it returns 200 OK
3. **Generate Test Cases**: For each field listed in column B, the system creates:
   - Empty field test case (field = "")
   - Invalid field test case (field = "INVALID_VALUE_random")
4. **Execute Tests**: Each test case is executed while keeping other fields with their original valid values
5. **Record Results**: HTTP status, response code, and response message are captured
6. **Real-time Display**: Results are shown in a table as they are processed
7. **Export**: Results can be downloaded as an Excel file

## Expected Output

The system will generate test cases like:

- Empty X-Service-ID
- Invalid X-Service-ID  
- Empty username
- Invalid username
- Empty password
- Invalid password
- etc.

Each test case shows:
- Test Case Name (e.g., "Empty X-Service-ID")
- Parameters used (e.g., "(X-Service-ID:,username:testuser,password:testpass,...)")
- Response (e.g., "httpStatus:400, code:INVALID_SERVICE_ID, message:Service ID is required")