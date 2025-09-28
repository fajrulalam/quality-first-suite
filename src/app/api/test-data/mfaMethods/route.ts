import { NextResponse } from 'next/server';


export async function POST(request: Request) {
  try {
    // Get tokens from previous calls
    const body = await request.json().catch(() => ({}));
    
    // Log the received body for debugging
    console.log('mfaMethods API received body:', body);
    
    // Extract loginToken - checking multiple possible locations
    const loginToken = body.loginToken || (body.data && body.data.loginToken);

    // Check if we should skip MFA methods (direct auth code flow)
    if (body.skipToAuthCodeVerify || (body.data && body.data.skipToAuthCodeVerify)) {
      console.log('Skipping MFA methods - direct auth code flow detected');
      return NextResponse.json({
        status: 'skipped',
        message: 'MFA methods skipped - using direct auth code flow',
        data: {
          reason: 'Direct auth code available, no MFA required',
          skipToAuthCodeVerify: true
        }
      });
    }

    if (!loginToken) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Login token is required for this operation',
          debug: {
            receivedBody: body,
            hasLoginToken: !!loginToken,
            hasSkipFlag: !!(body.skipToAuthCodeVerify || (body.data && body.data.skipToAuthCodeVerify))
          }
        },
        { status: 400 }
      );
    }

    const response = await fetch(`https://service.bliblitiket.tools/gks-unm-go-be/api/v1/mfa/methods?token=${loginToken}`, {
      method: 'GET',
      headers: {
        'X-Request-Id': crypto.randomUUID(),
        'X-Client-Id': '9dc79e3916a042abc86c2aa525bff009',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`MFA Methods API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Implement post-request script logic to extract mfaToken
    let mfaToken;
    if (data.data && data.data.token) {
      mfaToken = data.data.token;
      console.log('mfaToken saved:', mfaToken);
    } else {
      console.log('Token not found in response.');
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'MFA methods retrieved successfully',
      data: {
        ...data,
        // Pass through important tokens
        loginToken,
        // Add extracted mfaToken
        mfaToken
      }
    });
  } catch (error) {
    console.error('MFA Methods API Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'An error occurred while retrieving MFA methods',
      },
      { status: 500 }
    );
  }
}
