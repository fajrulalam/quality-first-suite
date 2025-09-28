import { NextResponse } from 'next/server';


export async function POST(request: Request) {
  try {
    // Get tokens from previous calls
    const body = await request.json().catch(() => ({}));

    // Default OTP code for testing - in a real app this would come from user input
    const otpCode = body.otpCode || '123456';

    // Make direct API call to get the actual response format
    const response = await fetch('https://service.bliblitiket.tools/gks-unm-go-be/api/v1/otp/verify', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code: otpCode })
    });
    
    const data = await response.json();
    console.log('Verify OTP Raw API Response:', JSON.stringify(data, null, 2));
    
    // Implement post-request script logic to extract passCode
    if (data && data.data && data.data.passCode) {
      console.log('passCode saved:', data.data.passCode);
    } else {
      console.log('passCode not found in response.');
    }
    
    // Return the EXACT raw API response - no wrapper bullshit
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Verify OTP API Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An error occurred while verifying OTP',
      },
      { status: 500 }
    );
  }
}
