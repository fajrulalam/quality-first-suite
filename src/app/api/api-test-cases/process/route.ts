import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
      'Access-Control-Max-Age': '86400',
    },
  });
}

interface FieldWithValues {
  fieldName: string;
  customValues: (string | number | boolean | null | undefined)[];
}

interface CurlData {
  apiName: string;
  curl: string;
  fieldsToTest: FieldWithValues[];
}

interface ParsedCurl {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: Record<string, unknown> | null;
  queryParams: Record<string, string>;
}

interface TestResult {
  apiName: string;
  testCase: string;
  parameters: string;
  response: string;
  httpStatus: number;
  responseCode?: string;
  responseMessage?: string;
  curlCommand?: string;
  errors?: string;
}

// Smart formatter for test case display
function formatTestCaseValue(value: unknown): string {
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  return String(value); // Numbers, booleans, etc. without quotes
}

// Extract errors from response
function extractErrors(responseData: string): string {
  try {
    const parsed = JSON.parse(responseData);
    
    // Check for common error fields
    if (parsed.errors) {
      if (Array.isArray(parsed.errors)) {
        return parsed.errors.map((err: unknown) => typeof err === 'string' ? err : JSON.stringify(err)).join('; ');
      } else if (typeof parsed.errors === 'string') {
        return parsed.errors;
      } else {
        return JSON.stringify(parsed.errors);
      }
    }
    
    // Check for error field (singular)
    if (parsed.error) {
      return typeof parsed.error === 'string' ? parsed.error : JSON.stringify(parsed.error);
    }
    
    // Check for message field that might contain errors
    if (parsed.message && (parsed.success === false || parsed.status === 'error')) {
      return parsed.message;
    }
    
    return '';
  } catch {
    // If response isn't JSON, return empty string
    return '';
  }
}

// Intelligently parse values based on quotes and content
function parseIntelligentValue(value: string, wasQuoted: boolean): string | number | boolean | null | undefined {
  // If it was quoted, treat as string regardless of content
  if (wasQuoted) {
    return value;
  }
  
  // If not quoted, try to parse as appropriate type
  const trimmed = value.trim();
  
  // Boolean values
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  
  // null/undefined
  if (trimmed === 'null') return null;
  if (trimmed === 'undefined') return undefined;
  
  // Numbers
  // Check for integer
  if (/^-?\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  }
  
  // Check for float/double
  if (/^-?\d*\.\d+$/.test(trimmed)) {
    return parseFloat(trimmed);
  }
  
  // If none of the above, treat as string
  return trimmed;
}

// Parse complex field string: searchType("CITY","REGION"),adult(1,2,10),simple
function parseComplexFieldString(fieldsStr: string): FieldWithValues[] {
  const fields: FieldWithValues[] = [];
  const trimmed = fieldsStr.trim();
  
  let i = 0;
  while (i < trimmed.length) {
    // Skip whitespace and commas
    while (i < trimmed.length && (trimmed[i] === ' ' || trimmed[i] === ',')) {
      i++;
    }
    
    if (i >= trimmed.length) break;
    
    // Find field name (everything up to '(' or next comma)
    const fieldStart = i;
    while (i < trimmed.length && trimmed[i] !== '(' && trimmed[i] !== ',') {
      i++;
    }
    
    const fieldName = trimmed.substring(fieldStart, i).trim();
    if (!fieldName) continue;
    
    const customValues: (string | number | boolean | null | undefined)[] = [];
    
    // Check if this field has custom values in parentheses
    if (i < trimmed.length && trimmed[i] === '(') {
      i++; // Skip opening parenthesis
      
      // Parse values until closing parenthesis
      while (i < trimmed.length && trimmed[i] !== ')') {
        // Skip whitespace and commas
        while (i < trimmed.length && (trimmed[i] === ' ' || trimmed[i] === ',')) {
          i++;
        }
        
        if (i >= trimmed.length || trimmed[i] === ')') break;
        
        // Parse value - could be quoted or unquoted
        let value = '';
        let wasQuoted = false;
        if (trimmed[i] === '"') {
          // Quoted value
          wasQuoted = true;
          i++; // Skip opening quote
          const valueStart = i;
          while (i < trimmed.length && trimmed[i] !== '"') {
            i++;
          }
          value = trimmed.substring(valueStart, i);
          if (i < trimmed.length) i++; // Skip closing quote
        } else {
          // Unquoted value
          const valueStart = i;
          while (i < trimmed.length && trimmed[i] !== ',' && trimmed[i] !== ')') {
            i++;
          }
          value = trimmed.substring(valueStart, i).trim();
        }
        
        if (value) {
          // Intelligently parse the value based on quotes and content
          customValues.push(parseIntelligentValue(value, wasQuoted));
        }
      }
      
      if (i < trimmed.length && trimmed[i] === ')') {
        i++; // Skip closing parenthesis
      }
    }
    
    fields.push({
      fieldName,
      customValues
    });
  }
  
  return fields;
}


// Parse Excel file and extract cURL data
function parseExcelFile(buffer: Buffer): CurlData[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
  
  console.log(`Excel file parsed: ${data.length} rows found`);
  data.forEach((row, index) => {
    console.log(`Row ${index}: ${Array.isArray(row) ? row.length : 0} columns - [${Array.isArray(row) ? row.slice(0, 2).map(cell => typeof cell + ':' + String(cell).substring(0, 50)).join(', ') : 'not array'}]`);
  });
  
  const curlDataArray: CurlData[] = [];
  
  // Skip header row if it's obviously a header
  const startRow = data[0] && (
    typeof data[0][0] === 'string' && 
    (data[0][0].toLowerCase().includes('api') || 
     data[0][0].toLowerCase().includes('name') || 
     data[0][0].toLowerCase().includes('curl') ||
     data[0][0].toLowerCase().startsWith('column'))
  ) ? 1 : 0;
  
  for (let i = startRow; i < data.length; i++) {
    const row = data[i];
    console.log(`Processing row ${i}:`, row?.length || 0, 'columns');
    
    if (row && Array.isArray(row) && row.length >= 3) {
      const apiName = row[0] ? row[0].toString().trim() : `API-${i}`;
      const curl = row[1] ? row[1].toString().trim() : '';
      const fieldsToTestStr = row[2] ? row[2].toString().trim() : '';
      
      console.log(`Row ${i} - API: "${apiName}", cURL length: ${curl.length}`);
      
      if (curl) {
        let fieldsToTest: FieldWithValues[] = [];
        if (fieldsToTestStr) {
          fieldsToTest = parseComplexFieldString(fieldsToTestStr);
        }
        
        if (fieldsToTest.length === 0) {
          console.log(`Warning: No fields to test specified for row ${i}, skipping field testing`);
        }
        
        curlDataArray.push({ apiName, curl, fieldsToTest });
        console.log(`Added cURL data for row ${i}: ${fieldsToTest.length} fields to test`);
        fieldsToTest.forEach(field => {
          console.log(`  - Field: ${field.fieldName}, Custom values: [${field.customValues.map(v => String(v)).join(', ')}]`);
        });
      } else {
        console.log(`Skipping row ${i}: empty cURL`);
      }
    } else if (row && Array.isArray(row) && row.length >= 1) {
      // Fallback for old 2-column format
      const curl = row[0] ? row[0].toString().trim() : '';
      const fieldsToTestStr = row[1] ? row[1].toString().trim() : '';
      
      if (curl) {
        let fieldsToTest: FieldWithValues[] = [];
        if (fieldsToTestStr) {
          fieldsToTest = parseComplexFieldString(fieldsToTestStr);
        }
        
        curlDataArray.push({ 
          apiName: `API-${i}`, 
          curl, 
          fieldsToTest 
        });
        console.log(`Added cURL data (legacy format) for row ${i}: ${fieldsToTest.length} fields to test`);
      }
    } else {
      console.log(`Skipping row ${i}: insufficient data (${row?.length || 0} columns)`);
    }
  }
  
  console.log(`Final result: ${curlDataArray.length} cURL commands extracted`);
  return curlDataArray;
}

// Parse cURL command to extract components
function parseCurl(curlCommand: string): ParsedCurl {
  const result: ParsedCurl = {
    method: 'GET',
    url: '',
    headers: {},
    body: null,
    queryParams: {}
  };

  // Clean up the command - handle multiline cURL with backslashes
  let cmd = curlCommand
    .replace(/\\\s*\n\s*/g, ' ') // Remove line continuations
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/^curl\s+/i, '') // Remove curl command
    .trim();

  console.log('Cleaned cURL command:', cmd.substring(0, 200) + '...');

  // Extract method - default to POST if data is present
  const methodMatch = cmd.match(/--request\s+(\w+)|--method\s+(\w+)|-X\s+(\w+)/i);
  if (methodMatch) {
    result.method = (methodMatch[1] || methodMatch[2] || methodMatch[3]).toUpperCase();
    cmd = cmd.replace(/--request\s+\w+|--method\s+\w+|-X\s+\w+/i, '').trim();
  } else if (cmd.includes('--data')) {
    // If no method specified but data is present, assume POST
    result.method = 'POST';
  }

  // Extract URL first (look for --location, --url, or URLs at the beginning/end of command)
  const locationMatch = cmd.match(/--location\s+['"]([^'"]+)['"]/i) || 
                       cmd.match(/--url\s+['"]([^'"]+)['"]/i) ||
                       // Match URLs at the beginning of command (common after curl removal)
                       cmd.match(/^['"]?(https?:\/\/[^\s'"]+)['"]?/i) ||
                       // Match URLs that are not part of header values (avoid matching "header: 'value with https://...'")
                       cmd.match(/(?:^|[^:]\s)['"]?(https?:\/\/[^\s'"]+)['"]?(?:\s*$)/i);
  
  if (locationMatch && locationMatch[1]) {
    const fullUrl = locationMatch[1];
    const [baseUrl, queryString] = fullUrl.split('?');
    result.url = baseUrl;
    
    if (queryString) {
      const params = new URLSearchParams(queryString);
      params.forEach((value, key) => {
        result.queryParams[key] = value;
      });
    }
    
    // Remove the matched URL from command
    cmd = cmd.replace(/--location\s+['"][^'"]+['"]/i, '').replace(/--url\s+['"][^'"]+['"]/i, '').trim();
  }

  // Extract headers - improved regex to handle various formats
  const headerMatches = cmd.match(/--header\s+['"]([^'"]+)['"]|-H\s+['"]([^'"]+)['"]/g);
  if (headerMatches) {
    headerMatches.forEach(match => {
      const headerContent = match.match(/--header\s+['"]([^'"]+)['"]|-H\s+['"]([^'"]+)['"]/i);
      if (headerContent && (headerContent[1] || headerContent[2])) {
        const headerValue = headerContent[1] || headerContent[2];
        const colonIndex = headerValue.indexOf(':');
        if (colonIndex > 0) {
          const key = headerValue.substring(0, colonIndex).trim();
          const value = headerValue.substring(colonIndex + 1).trim();
          if (key && value) {
            result.headers[key] = value;
          }
        }
      }
    });
    cmd = cmd.replace(/--header\s+['"][^'"]+['"]|-H\s+['"][^'"]+['"]/g, '').trim();
  }

  // Extract body data - handle both --data and --data-raw with proper quote matching
  const dataFlagMatch = cmd.match(/(--data(?:-raw)?)\s+(['"])/i);
  
  if (dataFlagMatch && dataFlagMatch.index !== undefined) {
    const quote = dataFlagMatch[2];
    const flagEnd = dataFlagMatch.index + dataFlagMatch[0].length;
    const remaining = cmd.substring(flagEnd);
    
    // Find the matching closing quote, handling escaped quotes
    let bodyEnd = -1;
    let escapeNext = false;
    
    for (let i = 0; i < remaining.length; i++) {
      const char = remaining[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if (char === quote) {
        bodyEnd = i;
        break;
      }
    }
    
    if (bodyEnd > 0) {
      const dataString = remaining.substring(0, bodyEnd).replace(/\\'/g, "'"); // Unescape quotes
      
      try {
        result.body = JSON.parse(dataString);
      } catch {
        // If not JSON, treat as form data or plain text
        if (dataString.includes('&') && dataString.includes('=')) {
          const formData: Record<string, unknown> = {};
          const pairs = dataString.split('&');
          pairs.forEach(pair => {
            const [key, value] = pair.split('=');
            if (key && value) {
              formData[decodeURIComponent(key)] = decodeURIComponent(value);
            }
          });
          result.body = formData;
        } else {
          // Treat as plain text/string
          result.body = { data: dataString };
        }
      }
      
      // Remove the data part from command with proper quote matching
      const fullDataPart = cmd.substring(dataFlagMatch.index!, flagEnd + bodyEnd + 1);
      cmd = cmd.replace(fullDataPart, '').trim();
    }
  }

  // If no URL found yet, try to extract from remaining command (avoid header values)
  if (!result.url) {
    // Try patterns in order of preference
    const beginningUrlMatch = cmd.match(/^['"]?(https?:\/\/[^\s'"]+)['"]?/i);
    const endUrlMatch = !beginningUrlMatch ? cmd.match(/(?:^|[^:]\s+)['"]?(https?:\/\/[^\s'"]+)['"]?\s*$/i) : null;
    const anyUrlMatch = !beginningUrlMatch && !endUrlMatch ? cmd.match(/(?:^|[^:]\s)(https?:\/\/[^\s'"]+)/i) : null;
    
    const urlMatch = beginningUrlMatch || endUrlMatch || anyUrlMatch;
    if (urlMatch) {
      const fullUrl = urlMatch[1];
      const [baseUrl, queryString] = fullUrl.split('?');
      result.url = baseUrl;
      
      if (queryString) {
        const params = new URLSearchParams(queryString);
        params.forEach((value, key) => {
          result.queryParams[key] = value;
        });
      }
    }
  }

  console.log('Parsed cURL:', {
    method: result.method,
    url: result.url,
    headersCount: Object.keys(result.headers).length,
    hasBody: !!result.body,
    queryParamsCount: Object.keys(result.queryParams).length
  });

  return result;
}

// Inject session tokens into parsed cURL
function injectSessionTokens(parsed: ParsedCurl, sessionAccessToken: string, sessionRefreshToken: string): ParsedCurl {
  if (!sessionAccessToken && !sessionRefreshToken) {
    return parsed; // No tokens to inject
  }

  const result = { ...parsed };
  const sessionCookie = `session_access_token=${sessionAccessToken || ''};session_refresh_token=${sessionRefreshToken || ''};`;
  
  // Check if Cookie header already exists
  const existingCookie = result.headers['Cookie'] || result.headers['cookie'] || '';
  
  if (existingCookie) {
    // Append to existing cookie
    result.headers['Cookie'] = sessionCookie + existingCookie;
  } else {
    // Create new cookie header
    result.headers['Cookie'] = sessionCookie;
  }
  
  // Remove any lowercase cookie header to avoid duplicates
  delete result.headers['cookie'];
  
  return result;
}

// Generate test cases for a field with custom values
function generateTestCases(field: FieldWithValues): Array<{ type: string; value: unknown }> {
  const testCases: Array<{ type: string; value: unknown }> = [];
  
  // Add custom values first
  field.customValues.forEach((customValue, index) => {
    testCases.push({
      type: `Custom${index + 1}`,
      value: customValue
    });
  });
  
  // Always add empty and invalid test cases
  testCases.push({ type: 'Empty', value: '' });
  testCases.push({ type: 'Invalid', value: 'INVALID_VALUE_' + Math.random().toString(36).substr(2, 9) });
  
  return testCases;
}

// Reconstruct cURL from parsed components
function reconstructCurl(parsed: ParsedCurl, fieldOverrides: Record<string, unknown>): string {
  let curl = `curl -X ${parsed.method}`;
  
  // Add headers
  const headers = { ...parsed.headers };
  Object.keys(fieldOverrides).forEach(field => {
    if (field in headers) {
      headers[field] = String(fieldOverrides[field] || '');
    }
  });
  
  Object.entries(headers).forEach(([key, value]) => {
    curl += ` -H "${key}: ${value}"`;
  });

  // Add body if exists
  if (parsed.body) {
    const body = { ...parsed.body };
    Object.keys(fieldOverrides).forEach(field => {
      if (field in body) {
        body[field] = fieldOverrides[field];
      }
    });
    curl += ` --data '${JSON.stringify(body)}'`;
  }

  // Add URL with query params
  let url = parsed.url;
  const queryParams = { ...parsed.queryParams };
  Object.keys(fieldOverrides).forEach(field => {
    if (field in queryParams) {
      queryParams[field] = String(fieldOverrides[field] || '');
    }
  });

  if (Object.keys(queryParams).length > 0) {
    const queryString = new URLSearchParams(queryParams).toString();
    url += '?' + queryString;
  }

  curl += ` "${url}"`;
  return curl;
}

// Execute HTTP request through proxy to bypass CORS
async function executeRequest(curlCommand: string, useProxy: boolean = true): Promise<{ httpStatus: number; responseCode?: string; responseMessage?: string; response: string }> {
  try {
    const parsed = parseCurl(curlCommand);
    
    let url = parsed.url;
    if (Object.keys(parsed.queryParams).length > 0) {
      const queryString = new URLSearchParams(parsed.queryParams).toString();
      url += '?' + queryString;
    }

    console.log(`Executing request: ${parsed.method} ${url}`);

    if (useProxy) {
      // Use proxy server to bypass CORS
      try {
        const proxyRequestBody = {
          url,
          method: parsed.method,
          headers: parsed.headers,
          body: parsed.body
        };

        console.log('Making proxy request with:', {
          url,
          method: parsed.method,
          headersCount: Object.keys(parsed.headers).length,
          hasBody: !!parsed.body
        });

        // Check if we're running locally (development) vs on Vercel (production)
        const isLocal = !process.env.VERCEL && !process.env.NEXTAUTH_URL;
        const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || (isLocal ? 'http://localhost:3000' : 'https://quality-first-suite.vercel.app');
        const proxyResponse = await fetch(`${baseUrl}/api/api-test-cases/proxy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(proxyRequestBody),
          signal: AbortSignal.timeout(35000)
        });

        if (!proxyResponse.ok) {
          throw new Error(`Proxy server error: ${proxyResponse.status} ${proxyResponse.statusText}`);
        }

        const proxyResult = await proxyResponse.json();
        
        if (proxyResult.error) {
          // Check if it's a network connectivity issue
          if (proxyResult.error.includes('Unable to reach') || proxyResult.error.includes('ECONNREFUSED') || proxyResult.error.includes('ENOTFOUND')) {
            throw new Error(`Network error: The API endpoint "${url}" is not accessible. This might be an internal/test environment that requires VPN access or IP whitelisting.`);
          }
          throw new Error(`Proxy error: ${proxyResult.error}`);
        }
        
        let responseCode = '';
        let responseMessage = '';
        
        if (proxyResult.data) {
          try {
            const responseJson = JSON.parse(proxyResult.data);
            responseCode = responseJson.code || responseJson.status || responseJson.statusCode || '';
            responseMessage = responseJson.message || responseJson.error || responseJson.msg || '';
          } catch {
            // Data is not JSON, use as plain text
            responseMessage = proxyResult.data;
          }
          
          if (!responseMessage && proxyResult.data) {
            responseMessage = proxyResult.data.substring(0, 200);
          }
        }

        console.log('Proxy response:', {
          status: proxyResult.status,
          ok: proxyResult.ok,
          dataLength: proxyResult.data ? proxyResult.data.length : 0
        });

        return {
          httpStatus: proxyResult.status || 0,
          responseCode,
          responseMessage: responseMessage || 'No response data',
          response: `httpStatus:${proxyResult.status || 0}, code:${responseCode}, message:${responseMessage || 'No response data'}`
        };
      } catch (proxyError) {
        console.error('Proxy request failed:', proxyError);
        const errorMessage = proxyError instanceof Error ? proxyError.message : 'Unknown proxy error';
        return {
          httpStatus: 0,
          responseCode: 'PROXY_ERROR',
          responseMessage: errorMessage,
          response: `httpStatus:0, code:PROXY_ERROR, message:${errorMessage}`
        };
      }
    } else {
      // Direct request (may fail due to CORS)
      const requestOptions: RequestInit = {
        method: parsed.method,
        headers: {
          ...parsed.headers,
          'Accept': parsed.headers['Accept'] || parsed.headers['accept'] || 'application/json, text/plain, */*',
          'User-Agent': 'API-Test-Cases-Generator/1.0'
        },
        signal: AbortSignal.timeout(10000)
      };

      if (parsed.body && ['POST', 'PUT', 'PATCH'].includes(parsed.method)) {
        requestOptions.body = JSON.stringify(parsed.body);
        const headers = requestOptions.headers as Record<string, string>;
        if (!headers['Content-Type'] && !headers['content-type']) {
          headers['Content-Type'] = 'application/json';
        }
      }
      
      const response = await fetch(url, requestOptions);
      const responseText = await response.text();
      
      let responseCode = '';
      let responseMessage = '';
      
      try {
        const responseJson = JSON.parse(responseText);
        responseCode = responseJson.code || responseJson.status || responseJson.statusCode || '';
        responseMessage = responseJson.message || responseJson.error || responseJson.msg || responseText.substring(0, 200);
      } catch {
        responseMessage = responseText.substring(0, 200);
      }

      return {
        httpStatus: response.status,
        responseCode,
        responseMessage,
        response: `httpStatus:${response.status}, code:${responseCode}, message:${responseMessage}`
      };
    }
  } catch (error) {
    let errorMessage = 'Unknown error';
    let httpStatus = 0;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        errorMessage = 'Request timeout';
        httpStatus = 408;
      } else if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
        errorMessage = 'CORS error - API blocks cross-origin requests';
        httpStatus = 0;
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Network error - Unable to reach the API';
        httpStatus = 0;
      }
    }

    console.error(`Request failed: ${errorMessage}`);
    
    return {
      httpStatus,
      responseCode: 'ERROR',
      responseMessage: errorMessage,
      response: `httpStatus:${httpStatus}, code:ERROR, message:${errorMessage}`
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const useProxy = formData.get('useProxy') === 'true';
    const sessionAccessToken = formData.get('sessionAccessToken') as string || '';
    const sessionRefreshToken = formData.get('sessionRefreshToken') as string || '';
    
    if (!file) {
      return new Response('No file provided', { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const curlDataArray = parseExcelFile(buffer);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let testCaseCount = 0;
        
        // Calculate total test cases
        const totalTestCases = curlDataArray.reduce((total, curlData) => {
          return total + curlData.fieldsToTest.reduce((fieldTotal, field) => {
            return fieldTotal + field.customValues.length + 2; // custom values + empty + invalid
          }, 0);
        }, 0);

        controller.enqueue(encoder.encode(JSON.stringify({
          type: 'progress',
          current: 0,
          total: totalTestCases
        }) + '\n'));

        for (const curlData of curlDataArray) {
          let parsed = parseCurl(curlData.curl);
          
          // Inject session tokens if provided
          parsed = injectSessionTokens(parsed, sessionAccessToken, sessionRefreshToken);
          
          // Validate that we successfully parsed the cURL
          if (!parsed.url) {
            controller.enqueue(encoder.encode(JSON.stringify({
              type: 'error',
              message: `ERROR: Failed to parse cURL command. Could not extract URL from: "${curlData.curl.substring(0, 100)}..."`
            }) + '\n'));
            continue;
          }
          
          // Validate the original cURL works (simplified logging)
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'info',
            message: `Testing ${curlData.apiName}: ${parsed.url}`
          }) + '\n'));

          const originalResult = await executeRequest(curlData.curl, useProxy);
          
          if (originalResult.httpStatus === 0) {
            controller.enqueue(encoder.encode(JSON.stringify({
              type: 'error',
              message: `ERROR: Cannot reach API "${parsed.url}". Error: ${originalResult.responseMessage}. Please check the URL and network connectivity.`
            }) + '\n'));
            continue;
          }
          
          if (originalResult.httpStatus < 200 || originalResult.httpStatus >= 300) {
            controller.enqueue(encoder.encode(JSON.stringify({
              type: 'info', 
              message: `INFO: Original cURL returned ${originalResult.httpStatus}: ${originalResult.responseMessage}. Proceeding with tests - this might be expected behavior.`
            }) + '\n'));
          } else {
            controller.enqueue(encoder.encode(JSON.stringify({
              type: 'info', 
              message: `SUCCESS: Original cURL validated successfully (${originalResult.httpStatus}). Starting field tests...`
            }) + '\n'));
          }

          // Generate test cases for each field
          for (const field of curlData.fieldsToTest) {
            const testCases = generateTestCases(field);
            
            for (const testCase of testCases) {
              testCaseCount++;
              
              const fieldOverrides = { [field.fieldName]: testCase.value };
              // Apply field overrides to a copy of the parsed data (which already has session tokens)
              const testParsed = { 
                ...parsed,
                headers: { ...parsed.headers },
                body: parsed.body ? { ...parsed.body } : null,
                queryParams: { ...parsed.queryParams }
              };
              
              // Apply field overrides
              Object.keys(fieldOverrides).forEach(fieldName => {
                if (fieldName in testParsed.headers) {
                  testParsed.headers[fieldName] = String(fieldOverrides[fieldName] || '');
                }
                if (testParsed.body && fieldName in testParsed.body) {
                  testParsed.body[fieldName] = fieldOverrides[fieldName];
                }
                if (fieldName in testParsed.queryParams) {
                  testParsed.queryParams[fieldName] = String(fieldOverrides[fieldName] || '');
                }
              });
              
              const modifiedCurl = reconstructCurl(testParsed, {});
              const result = await executeRequest(modifiedCurl, useProxy);
              
              // Format parameters string - ONLY show fields from Excel variables column
              const testFieldsOnly: Record<string, unknown> = {};
              curlData.fieldsToTest.forEach(testField => {
                if (testField.fieldName === field.fieldName) {
                  testFieldsOnly[testField.fieldName] = testCase.value;
                } else {
                  // Get original value from parsed data
                  const originalValue = parsed.headers[testField.fieldName] || 
                                      parsed.queryParams[testField.fieldName] || 
                                      (parsed.body && parsed.body[testField.fieldName]) || '';
                  testFieldsOnly[testField.fieldName] = originalValue;
                }
              });
              
              const parametersStr = Object.entries(testFieldsOnly)
                .map(([key, value]) => `${key}:${String(value || '')}`)
                .join(',');

              // Format response as (code:X,message:Y)
              const formattedResponse = `(code:${result.responseCode || result.httpStatus || 'UNKNOWN'},message:${result.responseMessage || 'No message'})`;
              
              // Better test case naming for custom values
              let testCaseName = `${testCase.type} ${field.fieldName}`;
              if (testCase.type.startsWith('Custom')) {
                testCaseName = `${field.fieldName}=${formatTestCaseValue(testCase.value)}`;
              }
              
              const testResult: TestResult = {
                apiName: curlData.apiName,
                testCase: testCaseName,
                parameters: `(${parametersStr})`,
                response: formattedResponse,
                httpStatus: result.httpStatus,
                responseCode: result.responseCode,
                responseMessage: result.responseMessage,
                curlCommand: modifiedCurl,
                errors: extractErrors(formattedResponse)
              };

              controller.enqueue(encoder.encode(JSON.stringify({
                type: 'result',
                result: testResult
              }) + '\n'));

              controller.enqueue(encoder.encode(JSON.stringify({
                type: 'progress',
                current: testCaseCount,
                total: totalTestCases
              }) + '\n'));
            }
          }
        }

        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
      },
    });
  } catch (error) {
    console.error('Processing error:', error);
    return new Response(`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
      }
    });
  }
}