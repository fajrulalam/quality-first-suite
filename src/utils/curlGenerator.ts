/**
 * CurlGenerator utility
 * Dynamically generates curl commands based on API calls
 */

export class CurlGenerator {
  static generate() {
    throw new Error("CurlGenerator temporarily disabled");
  }
}

export interface TokenData {
  accessToken?: string;
}

// Define the expected endpoint structure with optional methods
// interface ApiEndpoint {
//   url: string;
//   method: 'GET' | 'POST' | 'PUT' | 'DELETE';
//   getBody?: (params?: any) => any;
//   getQueryParams?: (tokens?: any) => Record<string, string>;
// }
//
// export interface ApiRequestConfig {
//   url: string;
//   method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
//   headers?: Record<string, string>;
//   queryParams?: Record<string, string>;
//   body?: any;
// }
//
// export type TokenData = {
//   accessToken?: string;
//   refreshToken?: string;
//   loginToken?: string;
//   authCode?: string;
//   hotelId?: string;
//   roomId?: string;
//   bookingCode?: string;
//   paymentCode?: string;
//   [key: string]: string | undefined;
// };
//
// export class CurlGenerator {
//   /**
//    * Generate a curl command string from an API request config
//    */
//   static generate(config: ApiRequestConfig): string {
//     const { url, method, headers = {}, queryParams = {}, body } = config;
//
//     // Build the final URL with query parameters
//     let finalUrl = url;
//     if (Object.keys(queryParams).length > 0) {
//       const queryString = Object.entries(queryParams)
//         .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
//         .join('&');
//       finalUrl = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
//     }
//
//     // Start building the curl command
//     let curl = `curl --location '${finalUrl}'`;
//
//     // Add method if not GET
//     if (method !== 'GET') {
//       curl += ` \
// --request ${method}`;
//     }
//
//     // Add headers
//     Object.entries(headers).forEach(([key, value]) => {
//       curl += ` \
// --header '${key}: ${value}'`;
//     });
//
//     // Add body if present
//     if (body) {
//       const bodyStr = typeof body === 'string'
//         ? body
//         : JSON.stringify(body, null, 2);
//       curl += ` \
// --data '${bodyStr}'`;
//     }
//
//     return curl;
//   }
//
//   /**
//    * Generate curl command for a specific API step using API_ENDPOINTS configuration
//    */
//   static generateFromEndpoint(stepId: string, tokens: TokenData = {}): string {
//     const endpoint = API_ENDPOINTS[stepId as keyof typeof API_ENDPOINTS] as unknown as ApiEndpoint;
//
//     if (!endpoint) {
//       throw new Error(`Unknown API endpoint: ${stepId}`);
//     }
//
//     const config: ApiRequestConfig = {
//       url: endpoint.url,
//       method: endpoint.method || 'GET'
//     };
//
//     // Add common headers
//     const headers: Record<string, string> = {
//       'Content-Type': 'application/json',
//       'Accept': 'application/json'
//     };
//
//     // Add specific headers for MFA methods endpoint
//     if (stepId === 'mfaMethods') {
//       headers['X-Request-Id'] = '<string>';
//       headers['X-Client-Id'] = '9dc79e3916a042abc86c2aa525bff009';
//     }
//
//     // Add specific headers for Generate OTP endpoint
//     if (stepId === 'generateOtp') {
//       headers['Accept-Language'] = 'id';
//       headers['True-Client-Ip'] = '127.0.0.1';
//       headers['X-Channel-Id'] = 'WEB';
//       headers['X-Forwarded-For'] = '127.0.0.1';
//       headers['X-Request-Id'] = '49f3c47b-4ca8-4b0a-b80d-9ebb887b6ec0';
//       headers['X-Client-Id'] = 'tiket123';
//       headers['X-Device-Id'] = '123';
//       headers['X-Session-Id'] = '123';
//       headers['User-Agent'] = 'Mozilla/5.0';
//       headers['X-User-Id'] = '100013863';
//       headers['X-Lang'] = 'id';
//     }
//
//     // Add specific headers for Submit MFA endpoint
//     if (stepId === 'submitMfa') {
//       headers['accept'] = '*/*';
//       headers['accept-language'] = 'en-US,en;q=0.9';
//       headers['content-type'] = 'text/plain;charset=UTF-8';
//       headers['origin'] = 'https://staging.bliblitiket.com';
//       headers['priority'] = 'u=1, i';
//       headers['referer'] = 'https://staging.bliblitiket.com/login?clientId=9dc79e3916a042abc86c2aa525bff009&ref=https%3A%2F%2Fgatotkaca.tiket.com%2Fhotel%3Futm_section%3DnavigationBar%253Blogin_label%26utm_logic%3Dnone&device_id=6a0fafee-0890-4655-b52a-0ce31dfc2323&lang=en&utm_section=navigationBar%3Blogin_label&utm_logic=none';
//       headers['sec-ch-ua'] = '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"';
//       headers['sec-ch-ua-mobile'] = '?0';
//       headers['sec-ch-ua-platform'] = '"macOS"';
//       headers['sec-fetch-dest'] = 'empty';
//       headers['sec-fetch-mode'] = 'cors';
//       headers['sec-fetch-site'] = 'same-origin';
//       headers['user-agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36';
//       headers['x-channel-id'] = 'DESKTOP';
//       headers['x-client-id'] = '9dc79e3916a042abc86c2aa525bff009';
//       headers['x-entity'] = 'tiket';
//       headers['x-lang'] = 'en';
//       headers['x-request-id'] = '521aed72-7f35-4c5b-93cf-7955513c21f1';
//       headers['Cookie'] = 'device_id=6a0fafee-0890-4655-b52a-0ce31dfc2323;';
//     }
//
//     // Add authorization if token is available (but skip for endpoints that use query params)
//     if (tokens.accessToken && stepId !== 'session' && stepId !== 'login' && !['mfaMethods', 'verifyAuthCode'].includes(stepId)) {
//       headers['Authorization'] = `Bearer ${tokens.accessToken}`;
//     } else if (tokens.loginToken && ['generateOtp', 'verifyOtp', 'submitMfa'].includes(stepId)) {
//       headers['Authorization'] = `Bearer ${tokens.loginToken}`;
//     }
//
//     config.headers = headers;
//
//     // Add query parameters if the endpoint has a getQueryParams function
//     if (endpoint.getQueryParams) {
//       config.queryParams = endpoint.getQueryParams(tokens);
//     }
//
//     // Add specific query parameters for certain endpoints
//     if (stepId === 'paymentDetail' && tokens.paymentCode) {
//       config.queryParams = { ...config.queryParams, paymentCode: tokens.paymentCode };
//     }
//
//     // Add body if this is a POST/PUT request and the endpoint has a getBody function
//     if ((config.method === 'POST' || config.method === 'PUT') && endpoint.getBody) {
//       config.body = endpoint.getBody(tokens);
//     } else if (config.method === 'POST' && !endpoint.getBody) {
//       // Fallback default body for POST endpoints without a getBody function
//       config.body = {};
//     }
//
//     // Add specific data for hotel endpoints
//     if (stepId === 'hotelPrebook' && tokens.hotelId && tokens.roomId) {
//       config.body = {
//         ...(config.body || {}),
//         hotelId: tokens.hotelId,
//         roomId: tokens.roomId,
//         checkIn: "2025-08-01",
//         checkOut: "2025-08-03",
//         roomCount: 1,
//         paxAdult: 2,
//         paxChild: 0
//       };
//     } else if (stepId === 'hotelBook' && tokens.bookingCode) {
//       config.body = {
//         ...(config.body || {}),
//         bookingCode: tokens.bookingCode,
//         guestName: "Tiket QA",
//         guestEmail: "tiket_qa@gmail.com",
//         guestPhone: "+6281234567890"
//       };
//     }
//
//     return this.generate(config);
//   }
// }
