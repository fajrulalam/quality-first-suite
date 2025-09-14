import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ message: "Endpoint temporarily disabled" });
}

// import { NextResponse } from 'next/server';
// import { makeApiRequest, extractTokens } from '@/utils/apiClient';
//
// export async function POST(request: Request) {
//   try {
//     // Get tokens from previous calls
//     const body = await request.json().catch(() => ({}));
//     const { loginToken, accessToken, refreshToken, mfaToken, otpId, passCode } = body;
//
//     if (!mfaToken) {
//       return NextResponse.json(
//         {
//           status: 'error',
//           message: 'MFA token is required for MFA submission',
//           debug: {
//             receivedBody: body,
//             hasMfaToken: !!mfaToken,
//             hasPassCode: !!passCode
//           }
//         },
//         { status: 400 }
//       );
//     }
//
//     if (!passCode) {
//       return NextResponse.json(
//         {
//           status: 'error',
//           message: 'PassCode is required for MFA submission',
//           debug: {
//             receivedBody: body,
//             hasMfaToken: !!mfaToken,
//             hasPassCode: !!passCode,
//             allTokens: Object.keys(body).filter(key => body[key])
//           }
//         },
//         { status: 400 }
//       );
//     }
//
//     // Generate unique request ID
//     const requestId = crypto.randomUUID();
//
//     // Log the request details for debugging
//     const requestBody = {
//       "token": mfaToken,
//       "type": "WA_OTP",
//       "identity": "fajrulalam01@gmail.com",
//       "secret": passCode
//     };
//
//     console.log('Submit MFA Request:', {
//       url: 'https://staging.bliblitiket.com/gateway/gks-unm-go-be/api/v1/mfa/submit',
//       requestId,
//       body: requestBody,
//       tokens: { mfaToken, passCode, hasValues: { mfaToken: !!mfaToken, passCode: !!passCode } }
//     });
//
//     const response = await fetch('https://staging.bliblitiket.com/gateway/gks-unm-go-be/api/v1/mfa/submit', {
//       method: 'POST',
//       headers: {
//         'accept': '*/*',
//         'accept-language': 'en-US,en;q=0.9',
//         'content-type': 'text/plain;charset=UTF-8',
//         'origin': 'https://staging.bliblitiket.com',
//         'priority': 'u=1, i',
//         'referer': 'https://staging.bliblitiket.com/login?clientId=9dc79e3916a042abc86c2aa525bff009&ref=https%3A%2F%2Fgatotkaca.tiket.com%2Fhotel%3Futm_section%3DnavigationBar%253Blogin_label%26utm_logic%3Dnone&device_id=6a0fafee-0890-4655-b52a-0ce31dfc2323&lang=en&utm_section=navigationBar%3Blogin_label&utm_logic=none',
//         'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
//         'sec-ch-ua-mobile': '?0',
//         'sec-ch-ua-platform': '"macOS"',
//         'sec-fetch-dest': 'empty',
//         'sec-fetch-mode': 'cors',
//         'sec-fetch-site': 'same-origin',
//         'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
//         'x-channel-id': 'DESKTOP',
//         'x-client-id': '9dc79e3916a042abc86c2aa525bff009',
//         'x-entity': 'tiket',
//         'x-lang': 'en',
//         'x-request-id': requestId,
//         'Cookie': 'device_id=6a0fafee-0890-4655-b52a-0ce31dfc2323;'
//       },
//       body: JSON.stringify(requestBody)
//     });
//
//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('Submit MFA API Error Response:', {
//         status: response.status,
//         statusText: response.statusText,
//         body: errorText,
//         headers: Object.fromEntries(response.headers.entries())
//       });
//
//       let errorData;
//       try {
//         errorData = JSON.parse(errorText);
//       } catch {
//         errorData = { message: errorText };
//       }
//
//       return NextResponse.json(
//         {
//           status: 'error',
//           message: `Submit MFA API request failed with status: ${response.status}`,
//           debug: {
//             requestBody: { mfaToken, passCode },
//             responseStatus: response.status,
//             responseBody: errorData,
//             hasRequiredTokens: { mfaToken: !!mfaToken, passCode: !!passCode }
//           }
//         },
//         { status: response.status }
//       );
//     }
//
//     const data = await response.json();
//     console.log('Submit MFA Success Response:', data);
//
//     // Extract any new tokens from the response
//     const newTokens = extractTokens(data);
//
//     return NextResponse.json({
//       status: 'success',
//       message: 'MFA submitted successfully',
//       data: {
//         ...data,
//         ...newTokens,
//         // Pass through important existing tokens
//         loginToken: newTokens.loginToken || loginToken,
//         accessToken: newTokens.accessToken || accessToken,
//         refreshToken: newTokens.refreshToken || refreshToken,
//         mfaToken: newTokens.mfaToken || mfaToken,
//         otpId: newTokens.otpId || otpId,
//         passCode: newTokens.passCode || passCode,
//         // Add authCode if present in the response
//         ...(data.data?.authCode && { authCode: data.data.authCode }),
//         ...(data.authCode && { authCode: data.authCode })
//       }
//     });
//   } catch (error) {
//     console.error('Submit MFA API Error:', error);
//     return NextResponse.json(
//       {
//         status: 'error',
//         message: error instanceof Error ? error.message : 'An error occurred while submitting MFA',
//       },
//       { status: 500 }
//     );
//   }
// }
