import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
import { makeApiRequest, extractTokens } from '@/utils/apiClient';

export async function POST(request: Request) {
  try {
    // Get tokens from previous calls
    const body = await request.json().catch(() => ({}));
    const { authCode, loginToken, accessToken, refreshToken } = body;

    if (!authCode) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Auth code is required for verification',
        },
        { status: 400 }
      );
    }

    const result = await makeApiRequest({
      url: 'https://staging.bliblitiket.com/gks-unm-go-be/api/v1/auth/code/verify',
      method: 'GET',
      tokens: { authCode, loginToken, accessToken, refreshToken },
      queryParams: { authCode }
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Auth code verification failed');
    }
    
    // Extract any new tokens from the response
    const newTokens = extractTokens(result.data);
    
    return NextResponse.json({
      status: 'success',
      message: 'Auth code verified successfully',
      data: {
        ...newTokens,
        // Pass through important existing tokens
        authCode: newTokens.authCode || authCode,
        loginToken: newTokens.loginToken || loginToken,
        accessToken: newTokens.accessToken || accessToken,
        refreshToken: newTokens.refreshToken || refreshToken
      }
    });
  } catch (error) {
    console.error('Verify Auth Code API Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'An error occurred while verifying auth code',
      },
      { status: 500 }
    );
  }
}
