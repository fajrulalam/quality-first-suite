/**
 * Utility functions for making API requests in the test data generation flow
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
export function makeApiRequest(_options: unknown) {
  return { success: false, error: "makeApiRequest temporarily disabled", data: {} };
}

export function extractTokens(_response: unknown) {
  return {
    authCode: undefined,
    loginToken: undefined,
    accessToken: undefined,
    refreshToken: undefined
  };
}

// interface ApiRequestOptions {
//   url: string;
//   method?: "GET" | "POST" | "PUT" | "DELETE";
//   headers?: Record<string, string>;
//   body?: any;
//   tokens?: {
//     accessToken?: string;
//     refreshToken?: string;
//     loginToken?: string;
//     authCode?: string;
//     [key: string]: any;
//   };
//   queryParams?: Record<string, string>;
// }
//
// export async function makeApiRequest({
//   url,
//   method = "GET",
//   headers = {},
//   body = undefined,
//   tokens = {},
//   queryParams = {},
// }: ApiRequestOptions) {
//   try {
//     // Add any tokens to headers if available
//     const requestHeaders: Record<string, string> = {
//       Accept: "*/*",
//       "Content-Type": "application/json",
//       ...headers,
//     };
//
//     // Add authorization headers if tokens are available
//     if (tokens.accessToken) {
//       requestHeaders["Authorization"] = `Bearer ${tokens.accessToken}`;
//     }
//
//     // Add query parameters to the URL if provided
//     if (Object.keys(queryParams).length > 0) {
//       const queryString = new URLSearchParams(queryParams).toString();
//       url = `${url}${url.includes("?") ? "&" : "?"}${queryString}`;
//     }
//
//     const requestOptions: RequestInit = {
//       method,
//       headers: requestHeaders,
//     };
//
//     // Add body for non-GET requests if provided
//     if (method !== "GET" && body !== undefined) {
//       requestOptions.body = JSON.stringify(body);
//     }
//
//     const response = await fetch(url, requestOptions);
//
//     if (!response.ok) {
//       throw new Error(
//         `API request to ${url} failed with status: ${response.status}`
//       );
//     }
//
//     const data = await response.json();
//     return { success: true, data };
//   } catch (error) {
//     console.error(`API Error for ${url}:`, error);
//     return {
//       success: false,
//       error:
//         error instanceof Error ? error.message : "An unknown error occurred",
//     };
//   }
// }
//
// // API endpoint configurations
// export const API_ENDPOINTS = {
//   session: {
//     url: "https://gatotkaca.tiket.com/ms-gateway/tix-member-session/v1/session",
//     method: "POST" as const,
//     getBody: () => ({}),
//   },
//   login: {
//     url: "https://staging.bliblitiket.com/gateway/gks-unm-go-be/api/v1/auth/login",
//     method: "POST" as const,
//     getBody: () => ({
//       // Add login credentials here for test environment
//     }),
//   },
//   mfaMethods: {
//     url: "https://service.bliblitiket.tools/gks-unm-go-be/api/v1/mfa/methods",
//     method: "GET" as const,
//     getQueryParams: (tokens: any) => ({
//       token: tokens.loginToken || "",
//     }),
//   },
//   generateOtp: {
//     url: "https://service.bliblitiket.tools/gks-unm-go-be/api/v1/otp/generate",
//     method: "POST" as const,
//     getBody: () => ({
//       action: "VERIFY_EMAIL",
//       channel: "EMAIL",
//       recipient: "fajrulalam01@gmail.com",
//       recaptchaToken: "",
//     }),
//   },
//   verifyOtp: {
//     url: "https://service.bliblitiket.tools/gks-unm-go-be/api/v1/otp/verify",
//     method: "POST" as const,
//     getBody: (params: any) => ({
//       code: params.otpCode || "123456", // Default for testing
//     }),
//   },
//   submitMfa: {
//     url: "https://staging.bliblitiket.com/gateway/gks-unm-go-be/api/v1/mfa/submit",
//     method: "POST" as const,
//     getBody: (params: any) => ({
//       token: params.mfaToken || "{{mfaToken}}",
//       type: "WA_OTP",
//       identity: "fajrulalam01@gmail.com",
//       secret: params.passCode || "{{passCode}}",
//     }),
//   },
//   verifyAuthCode: {
//     url: "https://staging.bliblitiket.com/gks-unm-go-be/api/v1/auth/code/verify",
//     method: "GET" as const,
//     getQueryParams: (tokens: any) => ({
//       authCode: tokens.authCode || "",
//     }),
//   },
//   serviceTicket: {
//     url: "https://member-core-v2-be-svc.test-platform-cluster.tiket.com/tix-member-core/v3/auth/unm/service-ticket",
//     method: "GET" as const,
//   },
//   activeOrderList: {
//     url: "https://gatotkaca.tiket.com/ms-gateway/tix-order-composer/yourorder/v1/activeorderlist",
//     method: "GET" as const,
//   },
//   hotelRoom: {
//     url: "https://gatotkaca.tiket.com/ms-gateway/tix-hotel-search/v3/room",
//     method: "GET" as const,
//   },
//   hotelPrebook: {
//     url: "https://gatotkaca.tiket.com/ms-gateway/tix-hotel-search/hotel/v4/prebook",
//     method: "POST" as const,
//     getBody: () => ({
//       // Hotel pre-booking parameters
//     }),
//   },
//   hotelBook: {
//     url: "https://gatotkaca.tiket.com/ms-gateway/tix-hotel-cart/hotel/v2/book",
//     method: "POST" as const,
//     getBody: () => ({
//       // Hotel booking parameters
//     }),
//   },
//   paymentDetail: {
//     url: "https://mpayment-gatotkaca.tiket.com/ms-gateway/tix-payment-core/payment/detail/SAKUKU",
//     method: "GET" as const,
//   },
// };
//
// // Helper to extract important tokens from API responses
// export function extractTokens(data: any) {
//   const tokens: Record<string, string> = {};
//
//   // Common token locations
//   if (data?.data?.accessToken) tokens.accessToken = data.data.accessToken;
//   if (data?.data?.refreshToken) tokens.refreshToken = data.data.refreshToken;
//   if (data?.data?.token || data?.token)
//     tokens.loginToken = data?.data?.token || data?.token;
//   if (data?.data?.authCode || data?.authCode)
//     tokens.authCode = data?.data?.authCode || data?.authCode;
//
//   return tokens;
// }
