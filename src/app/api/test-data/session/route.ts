import { NextResponse } from 'next/server';


export async function POST() {
  return NextResponse.json({ message: "Endpoint temporarily disabled" });
}

// import { NextResponse } from 'next/server';
//
// export async function POST(request: Request) {
//   try {
//     // Get request body if any
//     // const body = await request.json().catch(() => ({}));
//
//     const response = await fetch('https://gatotkaca.tiket.com/ms-gateway/tix-member-session/v1/session', {
//       method: 'POST',
//       headers: {
//         'Accept': '*/*',
//         'X-Audience': 'tiket.com',
//         'Content-Type': 'application/json',
//         'Cookie': 'session_access_token=eyJraWQiOiJ4SmFUUUpNaG9DSko2Q3N2VXdtblVUTEM2OHJFTU5fUSJ9.eyJhdWQiOiJ0aWtldC5jb20iLCJzdWIiOiI2ODc3NzE1NDU4ODhkMzU5MjBkNGZkZGIiLCJzdHQiOiIwIiwibmJmIjoxNzUyNjU4MjYwLCJ2IjoxLCJpc3MiOiJodHRwczovL3d3dy50aWtldC5jb20iLCJleHAiOjE3NTM4Njc4NjB9.N4AafhUJ-m6iMUU9g6HSoAablR95syhqqFaKaL7owDqQaKjuPQ6-vU5hms_40lsb; session_refresh_token=eyJraWQiOiJvSTB3VmJKcDA5U1VsdzVDRXVsTHp5TzFGYkdENWRveSJ9.eyJhdWQiOiJ0aWtldC5jb20vcnQiLCJzdWIiOiI2ODc3NzE1NDU4ODhkMzU5MjBkNGZkZGIiLCJzdHQiOiIwIiwibmJmIjoxNzUyNjU4MjYwLCJ2IjoxLCJpc3MiOiJodHRwczovL3d3dy50aWtldC5jb20iLCJleHAiOjE3NTM4Njc4NjB9.zWkWXSXy5KAwNk07L4n5jZnejoPgzcuw2MHE2jnM55HF8O3wSHDrqDFoHzTTKDU0; JSESSIONID=1B1F54CAB7D7A3A25129F587B004309D'
//       },
//       body: JSON.stringify({})
//     });
//
//     if (!response.ok) {
//       throw new Error(`API request failed with status: ${response.status}`);
//     }
//
//     const data = await response.json();
//
//     // Extract tokens
//     const accessToken = data.data?.accessToken;
//     const refreshToken = data.data?.refreshToken;
//
//     return NextResponse.json({
//       status: 'success',
//       message: 'Session tokens retrieved successfully',
//       data: {
//         accessToken,
//         refreshToken
//       }
//     });
//   } catch (error) {
//     console.error('Session API Error:', error);
//     return NextResponse.json(
//       {
//         status: 'error',
//         message: error instanceof Error ? error.message : 'An error occurred while retrieving session',
//       },
//       { status: 500 }
//     );
//   }
// }
