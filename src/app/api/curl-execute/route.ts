import { NextRequest, NextResponse } from 'next/server';

// Copy the exact same functions from the working route
interface ParsedCurl {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: Record<string, unknown> | null;
  queryParams: Record<string, string>;
}

// Parse cURL command to extract components (copied from process/route.ts)
function parseCurl(curlCommand: string): ParsedCurl {
  const result: ParsedCurl = {
    method: 'GET',
    url: '',
    headers: {},
    body: null,
    queryParams: {}
  };

  // Clean up the command - handle multiline cURL with backslashes
  const cmd = curlCommand
    .replace(/\\\s*\n\s*/g, ' ') // Remove line continuations
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/^curl\s+/i, '') // Remove curl command
    .trim();

  console.log('Cleaned cURL command:', cmd.substring(0, 200) + '...');

  // Extract method - default to POST if data is present
  const methodMatch = cmd.match(/--request\s+(\w+)|--method\s+(\w+)|-X\s+(\w+)/i);
  if (methodMatch) {
    result.method = (methodMatch[1] || methodMatch[2] || methodMatch[3]).toUpperCase();
  }

  // Extract URL (first quoted or unquoted string that looks like a URL)
  const urlPatterns = [
    /'([^']*https?:\/\/[^']*)'/,  // Single quoted URLs
    /"([^"]*https?:\/\/[^"]*)"/,  // Double quoted URLs
    /--url[=\s]+'([^']*)'/, // --url='...'
    /--url[=\s]+"([^"]*)"/, // --url="..."
    /--url[=\s]+([^\s]+)/,  // --url=...
    /(\bhttps?:\/\/[^\s'"]+)/ // Unquoted URLs
  ];

  for (const pattern of urlPatterns) {
    const match = cmd.match(pattern);
    if (match && match[1]) {
      result.url = match[1];
      break;
    }
  }

  // Extract headers
  const headerMatches = cmd.matchAll(/(?:-H|--header)\s+(?:'([^']*)'|"([^"]*)"|([^\s]+))/g);
  for (const match of headerMatches) {
    const headerValue = match[1] || match[2] || match[3];
    if (headerValue) {
      const colonIndex = headerValue.indexOf(':');
      if (colonIndex > 0) {
        const key = headerValue.substring(0, colonIndex).trim();
        const value = headerValue.substring(colonIndex + 1).trim();
        result.headers[key] = value;
      }
    }
  }

  // Extract body/data with better parsing
  const dataPatterns = [
    /(?:-d|--data|--data-raw)\s+'([^']*)'/,
    /(?:-d|--data|--data-raw)\s+"([^"]*)"/,
    /(?:-d|--data|--data-raw)\s+([^\s-][^\s]*)/
  ];

  for (const pattern of dataPatterns) {
    const match = cmd.match(pattern);
    if (match) {
      const data = match[1] || match[2] || match[3];
      try {
        result.body = JSON.parse(data);
      } catch {
        // If not JSON, treat as form data or plain text
        result.body = { data };
      }
      break;
    }
  }

  // If method wasn't explicitly set but we have data, assume POST
  if (!methodMatch && result.body) {
    result.method = 'POST';
  }

  return result;
}

// Execute request using the same logic as the working route
async function executeRequest(curlCommand: string, useProxy: boolean = true) {
  console.log(`Executing request: ${curlCommand.split('\n')[0].substring(0, 100)}...`);
  
  try {
    // Parse cURL first (same as working route)
    const parsed = parseCurl(curlCommand);
    const url = parsed.url;

    if (!url) {
      throw new Error('Failed to parse URL from cURL command');
    }

    console.log(`Executing request: ${parsed.method} ${url}`);

    if (useProxy) {

      // Use proxy server to bypass CORS (same as working route)
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

      const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'https://quality-first-suite.vercel.app';
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
        throw new Error(`Proxy error: ${proxyResult.error}`);
      }
      
      let responseCode = '';
      let responseMessage = '';
      
      if (proxyResult.data) {
        try {
          const responseData = JSON.parse(proxyResult.data);
          responseCode = responseData.responseCode || '';
          responseMessage = responseData.responseMessage || '';
        } catch {
          // If response is not JSON, use it as is
          responseCode = '';
          responseMessage = '';
        }
      }

      return {
        success: proxyResult.ok,
        httpStatus: proxyResult.status,
        response: proxyResult.data || '',
        responseCode,
        responseMessage,
        headers: proxyResult.headers || {}
      };
    } else {
      // Direct request (may fail due to CORS but will work locally with VPN)
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
        success: response.ok,
        httpStatus: response.status,
        response: responseText,
        responseCode,
        responseMessage,
        headers: Object.fromEntries(response.headers.entries())
      };
    }
  } catch (error) {
    console.error('Request execution failed:', error);
    return {
      success: false,
      httpStatus: 0,
      response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      responseCode: '',
      responseMessage: '',
      headers: {}
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { curlCommand } = await request.json();
    
    if (!curlCommand) {
      return new NextResponse(
        generateErrorHTML('No cURL command provided'),
        { 
          status: 400,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    // Try direct request first (like table generation might be doing), then fallback to proxy
    let result = await executeRequest(curlCommand, false);
    
    // If direct request fails, try with proxy
    if (result.httpStatus === 0 || !result.success) {
      console.log('Direct request failed, trying with proxy...');
      result = await executeRequest(curlCommand, true);
    }

    // Generate formatted HTML response
    const html = generateResponseHTML(curlCommand, result);
    
    return new NextResponse(html, {
      headers: { 
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Curl execute error:', error);
    return new NextResponse(
      generateErrorHTML(`Execution error: ${error instanceof Error ? error.message : 'Unknown error'}`),
      { 
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}


interface ExecutionResult {
  success: boolean;
  httpStatus: number;
  response: string;
  responseCode: string;
  responseMessage: string;
  headers: Record<string, string>;
}

function generateResponseHTML(curlCommand: string, result: ExecutionResult): string {
  const responseData = String(result.response || '');
  let formattedResponse = '';
  
  try {
    // Try to parse and format as JSON
    const parsed = JSON.parse(responseData);
    formattedResponse = JSON.stringify(parsed, null, 2);
  } catch {
    // If not JSON, use as-is
    formattedResponse = responseData;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Response - ${result.httpStatus}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
            line-height: 1.6;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: ${result.httpStatus >= 200 && result.httpStatus < 300 ? '#10b981' : result.httpStatus >= 400 ? '#ef4444' : '#f59e0b'};
            color: white;
            padding: 20px;
        }
        .status {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .url {
            font-family: 'Courier New', monospace;
            opacity: 0.9;
            word-break: break-all;
        }
        .section {
            padding: 20px;
            border-bottom: 1px solid #e5e7eb;
        }
        .section:last-child {
            border-bottom: none;
        }
        .section-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            color: #374151;
        }
        .code-block {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 15px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            overflow-x: auto;
            white-space: pre-wrap;
        }
        .response-data {
            background: #1f2937;
            color: #f9fafb;
            border-radius: 6px;
            padding: 20px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            overflow-x: auto;
            white-space: pre-wrap;
            line-height: 1.5;
        }
        .headers-grid {
            display: grid;
            gap: 10px;
        }
        .header-item {
            display: flex;
            padding: 8px 12px;
            background: #f9fafb;
            border-radius: 4px;
            border-left: 4px solid #3b82f6;
        }
        .header-key {
            font-weight: 600;
            margin-right: 10px;
            color: #1f2937;
            min-width: 150px;
        }
        .header-value {
            color: #6b7280;
            word-break: break-all;
        }
        .copy-btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 10px;
        }
        .copy-btn:hover {
            background: #2563eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="status">HTTP ${result.httpStatus} ${result.success ? 'OK' : 'Error'}</div>
            <div class="url">${curlCommand.includes('http') ? curlCommand.match(/https?:\/\/[^\s'"]+/)?.[0] || 'Unknown URL' : 'Unknown URL'}</div>
        </div>
        
        <div class="section">
            <div class="section-title">cURL Command</div>
            <div class="code-block">${curlCommand}</div>
            <button class="copy-btn" onclick="copyToClipboard(\`${curlCommand.replace(/`/g, '\\`')}\`)">
                Copy cURL
            </button>
        </div>
        
        ${Object.keys(result.headers || {}).length > 0 ? `
        <div class="section">
            <div class="section-title">Response Headers</div>
            <div class="headers-grid">
                ${Object.entries(result.headers || {}).map(([key, value]) => 
                  `<div class="header-item">
                     <div class="header-key">${key}:</div>
                     <div class="header-value">${value}</div>
                   </div>`
                ).join('')}
            </div>
        </div>
        ` : ''}
        
        <div class="section">
            <div class="section-title">Response Body</div>
            <div class="response-data">${formattedResponse}</div>
            <button class="copy-btn" onclick="copyToClipboard(\`${formattedResponse.replace(/`/g, '\\`')}\`)">
                Copy Response
            </button>
        </div>
    </div>

    <script>
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(function() {
                // Visual feedback
                event.target.textContent = 'Copied!';
                setTimeout(() => {
                    event.target.textContent = event.target.textContent.includes('cURL') ? 'Copy cURL' : 'Copy Response';
                }, 2000);
            }).catch(function(err) {
                console.error('Could not copy text: ', err);
                alert('Failed to copy to clipboard');
            });
        }
    </script>
</body>
</html>`;
}

function generateErrorHTML(error: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - API Execution</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #fee2e2;
            color: #991b1b;
        }
        .error-container {
            max-width: 800px;
            margin: 50px auto;
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border-left: 5px solid #ef4444;
        }
        .error-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #dc2626;
        }
        .error-message {
            font-size: 16px;
            line-height: 1.5;
            color: #7f1d1d;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-title">❌ Execution Failed</div>
        <div class="error-message">${error}</div>
    </div>
</body>
</html>`;
}