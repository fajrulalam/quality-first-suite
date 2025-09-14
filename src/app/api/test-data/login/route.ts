import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ message: "Endpoint temporarily disabled" });
}

// import { NextResponse } from "next/server";
//
// export async function POST(request: Request) {
//   try {
//     // Get request body with any tokens from previous calls
//     const body = await request.json().catch(() => ({}));
//     const { accessToken, refreshToken } = body;
//
//     // Generate a unique request ID
//     const requestId = crypto.randomUUID();
//
//     const response = await fetch(
//       "https://staging.bliblitiket.com/gateway/gks-unm-go-be/api/v1/auth/login",
//       {
//         method: "POST",
//         headers: {
//           accept: "*/*",
//           "accept-language": "en-US,en;q=0.9",
//           "content-type": "text/plain;charset=UTF-8",
//           lang: "en",
//           origin: "https://staging.bliblitiket.com",
//           priority: "u=1, i",
//           referer: "https://staging.bliblitiket.com/login?",
//           "sec-ch-ua":
//             '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
//           "sec-ch-ua-mobile": "?0",
//           "sec-ch-ua-platform": '"macOS"',
//           "sec-fetch-dest": "empty",
//           "sec-fetch-mode": "cors",
//           "sec-fetch-site": "same-origin",
//           "user-agent":
//             "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
//           "x-channel-id": "DESKTOP",
//           "x-client-id": "9dc79e3916a042abc86c2aa525bff009",
//           "x-entity": "tiket",
//           "x-lang": "en",
//           "x-request-id": requestId,
//           // Include session refresh token from previous calls if available
//           // 'Cookie': `session_refresh_token=${refreshToken || 'eyJhbGciOiJFZERTQSIsImtpZCI6ImJ4YlVDT1pPY3FrIiwidHlwIjoiSldUIn0.eyJfdGNzIjoibm9uZSIsIl90cnMiOiJub25lIiwiZXhwIjoxNzU0MDI4NjkwLCJpYXQiOjE3NTI4MTkwOTAsImlzcyI6Imh0dHBzOi8vc3RhZ2luZy5ibGlibGl0aWtldC5jb20iLCJqdGkiOiJyakhya3FEOUxhM0xVVEgwNl9STWpMSWZ0MjFmQXRMUyIsIm5iZiI6MTc1MjgxOTA5MCwicmVmcmVzaElkIjoiMTA2MmZjMWQtZTRiYy00MTgwLTk4NDctZjRmMDhlYmNiMmI4Iiwic2Vzc2lvbklkIjoicmpIcmtxRDlMYTNMVVRIMDZfUk1qTElmdDIxZkF0TFMiLCJzdWIiOiIxMDAxOTYyNTAiLCJ0b3BpYyI6IlJFRlJFU0hfVE9LRU4iLCJ1c2VySWQiOjEwMDE5NjI1MH0.hmWLZK9wdSMlpdoXYJ2v2Fl51HZsPr1Yn2eymPHOYp1zWakAUhXYwqERhcBQy8RonD0xcPWLjHt8CBlJVou6Cg'}`
//         },
//         body: JSON.stringify({
//           type: "EMAIL_PASSWORD",
//           identity: "fajrulalam01@gmail.com",
//           secret: "Tiket123!",
//           ref: "https://gatotkaca.tiket.com/",
//         }),
//       }
//     );
//
//     if (!response.ok) {
//       throw new Error(
//         `Login API request failed with status: ${response.status}`
//       );
//     }
//
//     const data = await response.json();
//     console.log("Login API response:", data);
//
//     let responseData: any = {};
//     let skipToAuthCodeVerify = false;
//
//     // Handle response based on its format
//     if (data.data?.redirectUrl && data.code === "SUCCESS") {
//       // Option 2: SUCCESS with redirectUrl containing authCode
//       const redirectUrl = data.data.redirectUrl;
//       const authCodeMatch = redirectUrl.match(/authCode=([^&]+)/);
//
//       if (authCodeMatch && authCodeMatch[1]) {
//         const authCode = authCodeMatch[1];
//         responseData.authCode = authCode;
//         skipToAuthCodeVerify = true;
//         console.log("Auth Code extracted from redirectUrl:", authCode);
//       } else {
//         console.log("Auth Code not found in redirectUrl");
//       }
//     }
//     // Option 1: MFA_REQUIRED with token
//     else if (data.data?.token && data.code === "MFA_REQUIRED") {
//       const loginToken = data.data.token;
//       responseData.loginToken = loginToken;
//       console.log("MFA required, login token extracted:", loginToken);
//     }
//     // Fallback for other formats
//     else {
//       // Generic extraction for any other format
//       responseData.loginToken = data.data?.token || data.token;
//       console.log("Using generic token extraction");
//     }
//
//     return NextResponse.json({
//       status: "success",
//       message: "Login successful",
//       data: {
//         ...responseData,
//         // Include flag to indicate if we should skip to auth code verification
//         skipToAuthCodeVerify,
//         // Pass through any tokens we received earlier
//         accessToken,
//         refreshToken,
//         // Include original response data for debugging
//         originalResponse: data,
//       },
//     });
//   } catch (error) {
//     console.error("Login API Error:", error);
//     return NextResponse.json(
//       {
//         status: "error",
//         message:
//           error instanceof Error
//             ? error.message
//             : "An error occurred during login",
//       },
//       { status: 500 }
//     );
//   }
// }
