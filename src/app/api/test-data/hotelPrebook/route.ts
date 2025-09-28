import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function POST(request: Request) {
  try {
    // Get tokens and data from previous calls
    const body = await request.json().catch(() => ({}));
    const { accessToken, refreshToken, loginToken, hotelId, roomId } = body;

    if (!accessToken) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Access token is required for hotel prebooking',
        },
        { status: 400 }
      );
    }

    // Default values if not provided from previous steps
    const hotelIdToUse = hotelId || '100048';
    const roomIdToUse = roomId || 'STD0002';

    // Mock prebooking request parameters
    const prebookingParams = {
      checkInDate: '2025-08-10',
      checkOutDate: '2025-08-12',
      hotelId: hotelIdToUse,
      roomId: roomIdToUse,
      guestInfo: {
        adultCount: 2,
        childCount: 0,
        childAge: []
      },
      roomCount: 1
    };

    const response = await fetch('https://gatotkaca.tiket.com/ms-gateway/tix-hotel-search/hotel/v4/prebook', {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'X-Audience': 'tiket.com',
        'Authorization': `Bearer ${accessToken}`,
        'Cookie': `session_access_token=${accessToken}; session_refresh_token=${refreshToken}`
      },
      body: JSON.stringify(prebookingParams)
    });
    
    if (!response.ok) {
      throw new Error(`Hotel prebooking failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      status: 'success',
      message: 'Hotel prebooking successful',
      data: {
        // Include key booking data for the next step
        bookingCode: data?.data?.bookingCode || 'PRE123456789',
        hotelId: hotelIdToUse,
        roomId: roomIdToUse,
        // Pass through important tokens
        accessToken,
        refreshToken,
        loginToken
      }
    });
  } catch (error) {
    console.error('Hotel Prebook API Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'An error occurred during hotel prebooking',
      },
      { status: 500 }
    );
  }
}
