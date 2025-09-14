import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ message: "Endpoint temporarily disabled" });
}

// import { NextResponse } from 'next/server';
//
// export async function POST(request: Request) {
//   try {
//     // Get tokens from previous calls
//     const body = await request.json().catch(() => ({}));
//     const { accessToken, refreshToken, loginToken } = body;
//
//     if (!accessToken) {
//       return NextResponse.json(
//         {
//           status: 'error',
//           message: 'Access token is required for hotel room search',
//         },
//         { status: 400 }
//       );
//     }
//
//     // Mock hotel search parameters for testing
//     const searchParams = {
//       checkInDate: '2025-08-10',
//       checkOutDate: '2025-08-12',
//       cityId: '11771', // Jakarta
//       roomCount: 1,
//       adultCount: 2,
//       childCount: 0,
//       childAge: [],
//       sortBy: 'popularity',
//       page: 1,
//       isInstantVoucher: false
//     };
//
//     const response = await fetch('https://gatotkaca.tiket.com/ms-gateway/tix-hotel-search/v3/room', {
//       method: 'GET',
//       headers: {
//         'Accept': '*/*',
//         'Content-Type': 'application/json',
//         'X-Audience': 'tiket.com',
//         'Authorization': `Bearer ${accessToken}`,
//         'Cookie': `session_access_token=${accessToken}; session_refresh_token=${refreshToken}`
//       }
//     });
//
//     if (!response.ok) {
//       throw new Error(`Hotel room search failed with status: ${response.status}`);
//     }
//
//     const data = await response.json();
//
//     return NextResponse.json({
//       status: 'success',
//       message: 'Hotel rooms retrieved successfully',
//       data: {
//         // Include key hotel room data for the next step
//         hotelId: data?.data?.hotels?.[0]?.id || '100048',
//         roomId: data?.data?.hotels?.[0]?.rooms?.[0]?.id || 'STD0002',
//         // Pass through important tokens
//         accessToken,
//         refreshToken,
//         loginToken
//       }
//     });
//   } catch (error) {
//     console.error('Hotel Room API Error:', error);
//     return NextResponse.json(
//       {
//         status: 'error',
//         message: error instanceof Error ? error.message : 'An error occurred during hotel room search',
//       },
//       { status: 500 }
//     );
//   }
// }
