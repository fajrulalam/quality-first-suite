import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ message: "Hotel booking endpoint temporarily disabled" });
}

// export async function POST(request: Request) {
//   try {
//     // Get tokens and data from previous calls
//     const body = await request.json().catch(() => ({}));
//     const { accessToken, refreshToken, loginToken, bookingCode, hotelId, roomId } = body;
//
//     if (!accessToken || !bookingCode) {
//       return NextResponse.json(
//         {
//           status: 'error',
//           message: 'Access token and booking code are required for hotel booking',
//         },
//         { status: 400 }
//       );
//     }
//
//     // Default values if not provided from previous steps
//     const hotelIdToUse = hotelId || '100048';
//     const roomIdToUse = roomId || 'STD0002';
//     const bookingCodeToUse = bookingCode || 'PRE123456789';
//
//     // Mock booking request parameters
//     const bookingParams = {
//       bookingCode: bookingCodeToUse,
//       customer: {
//         title: 'Mr',
//         firstName: 'Test',
//         lastName: 'User',
//         email: 'test@tiket.com',
//         phone: '081234567890',
//         nationality: 'ID'
//       },
//       payment: {
//         method: 'SAKUKU'
//       },
//       roomGuests: [
//         {
//           roomIndex: 1,
//           guests: [
//             {
//               title: 'Mr',
//               firstName: 'Test',
//               lastName: 'User',
//               type: 'ADULT'
//             },
//             {
//               title: 'Mrs',
//               firstName: 'Test',
//               lastName: 'User',
//               type: 'ADULT'
//             }
//           ]
//         }
//       ],
//       specialRequest: ''
//     };
//
//     const response = await fetch('https://gatotkaca.tiket.com/ms-gateway/tix-hotel-cart/hotel/v2/book', {
//       method: 'POST',
//       headers: {
//         'Accept': '*/*',
//         'Content-Type': 'application/json',
//         'X-Audience': 'tiket.com',
//         'Authorization': `Bearer ${accessToken}`,
//         'Cookie': `session_access_token=${accessToken}; session_refresh_token=${refreshToken}`
//       },
//       body: JSON.stringify(bookingParams)
//     });
//
//     if (!response.ok) {
//       throw new Error(`Hotel booking failed with status: ${response.status}`);
//     }
//
//     const data = await response.json();
//
//     return NextResponse.json({
//       status: 'success',
//       message: 'Hotel booking successful',
//       data: {
//         // Include key booking data for the next step
//         orderId: data?.data?.orderId || 'ORD123456789',
//         bookingCode: bookingCodeToUse,
//         paymentCode: data?.data?.paymentCode || 'PAY123456789',
//         // Pass through important tokens
//         accessToken,
//         refreshToken,
//         loginToken
//       }
//     });
//   } catch (error) {
//     console.error('Hotel Book API Error:', error);
//     return NextResponse.json(
//       {
//         status: 'error',
//         message: error instanceof Error ? error.message : 'An error occurred during hotel booking',
//       },
//       { status: 500 }
//     );
//   }
// }
