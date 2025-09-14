import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(request: NextRequest) {
  let url = '';
  let method = '';
  const cleanHeaders: Record<string, string> = {};
  
  try {
    const requestBody = await request.json();
    url = requestBody.url;
    method = requestBody.method;
    const headers = requestBody.headers;
    const body = requestBody.body;

    if (!url || !method) {
      return NextResponse.json(
        { error: 'URL and method are required' },
        { status: 400 }
      );
    }

    // Clean up headers - KEEP ALL IMPORTANT HEADERS including Cookie, Authorization, etc.
    Object.entries(headers || {}).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      
      // Only skip truly problematic browser-specific headers that cause network issues
      // KEEP Cookie, Authorization, and all other authentication/API headers!
      if (!['host', 'accept-encoding', 'connection', 'upgrade-insecure-requests', 'sec-ch-ua', 'sec-ch-ua-mobile', 'sec-ch-ua-platform'].includes(lowerKey)) {
        cleanHeaders[key] = String(value);
      }
    });

    // Add a proper User-Agent if not present
    if (!cleanHeaders['User-Agent'] && !cleanHeaders['user-agent']) {
      cleanHeaders['User-Agent'] = 'API-Test-Cases-Generator/1.0';
    }

    console.log(`\n🌐 PROXY REQUEST: ${method} ${url}`);
    console.log('Clean headers:', Object.keys(cleanHeaders));
    console.log('Request body present:', !!body);
    
    // Log the equivalent cURL command for debugging
    let curlEquivalent = `curl -X ${method.toUpperCase()}`;
    Object.entries(cleanHeaders).forEach(([key, value]) => {
      curlEquivalent += ` -H "${key}: ${value}"`;
    });
    if (body) {
      if (typeof body === 'string') {
        curlEquivalent += ` --data '${body}'`;
      } else {
        curlEquivalent += ` --data '${JSON.stringify(body)}'`;
      }
    }
    curlEquivalent += ` "${url}"`;
    
    console.log('📋 NETWORK cURL EQUIVALENT:');
    console.log(curlEquivalent);
    console.log('=' .repeat(100));

    const requestOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: cleanHeaders,
      // Add timeout of 30 seconds for proxy requests
      signal: AbortSignal.timeout(30000)
    };

    // Add body for POST/PUT/PATCH requests
    if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      if (typeof body === 'string') {
        requestOptions.body = body;
      } else if (typeof body === 'object') {
        requestOptions.body = JSON.stringify(body);
        // Ensure Content-Type is set for JSON if not already specified
        if (!cleanHeaders['Content-Type'] && !cleanHeaders['content-type']) {
          cleanHeaders['Content-Type'] = 'application/json';
        }
      }
    }

    const response = await fetch(url, requestOptions);
    
    // Get response text/data
    let responseData: string;
    try {
      responseData = await response.text();
    } catch (error) {
      responseData = `Error reading response: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    // Parse response headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    console.log(`Proxy response: ${response.status} ${response.statusText}`);

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data: responseData,
      ok: response.ok
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
      }
    });

  } catch (error) {
    console.error('Proxy error:', error);
    console.error('Request details:', { url, method, headersCount: Object.keys(cleanHeaders).length });
    
    let errorMessage = 'Unknown proxy error';
    let status = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 500)
      });
      
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        errorMessage = 'Request timeout (30s)';
        status = 408;
      } else if (error.message.includes('fetch') || error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        errorMessage = `Network error - Unable to reach ${url}: ${error.message}`;
        status = 502; // Bad Gateway
      } else if (error.message.includes('Invalid URL')) {
        errorMessage = `Invalid URL: ${url}`;
        status = 400;
      }
    }

    return NextResponse.json(
      {
        status: status,
        statusText: 'Proxy Error',
        headers: {},
        data: errorMessage,
        ok: false,
        error: errorMessage
      },
      { 
        status: 200, // Always return 200 to the client, actual status is in the body
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
        }
      }
    );
  }
}