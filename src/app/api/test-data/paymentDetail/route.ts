import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get tokens and data from previous calls
    const body = await request.json().catch(() => ({}));
    const { accessToken, refreshToken, loginToken, orderId, paymentCode } = body;

    if (!accessToken || !paymentCode) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Access token and payment code are required for payment details',
        },
        { status: 400 }
      );
    }

    // Default value if not provided from previous steps
    const paymentCodeToUse = paymentCode || 'PAY123456789';
    const orderIdToUse = orderId || 'ORD123456789';

    const response = await fetch(`https://mpayment-gatotkaca.tiket.com/ms-gateway/tix-payment-core/payment/detail/SAKUKU`, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'X-Audience': 'tiket.com',
        'Authorization': `Bearer ${accessToken}`,
        'Cookie': `session_access_token=${accessToken}; session_refresh_token=${refreshToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Payment details retrieval failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      status: 'success',
      message: 'Payment details retrieved successfully',
      data: {
        // Include key payment data
        orderId: orderIdToUse,
        paymentCode: paymentCodeToUse,
        paymentStatus: data?.data?.status || 'PENDING',
        paymentMethod: 'SAKUKU',
        // Pass through important tokens
        accessToken,
        refreshToken,
        loginToken
      }
    });
  } catch (error) {
    console.error('Payment Detail API Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'An error occurred retrieving payment details',
      },
      { status: 500 }
    );
  }
}
