import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Get tokens from previous calls
    const body = await request.json().catch(() => ({}));
    const { loginToken, accessToken, refreshToken, mfaToken } = body;

    // Generate unique request ID
    const requestId = crypto.randomUUID();

    const response = await fetch(
      "https://service.bliblitiket.tools/gks-unm-go-be/api/v1/otp/generate",
      {
        method: "POST",
        headers: {
          "Accept-Language": "id",
          "True-Client-Ip": "127.0.0.1",
          "X-Channel-Id": "WEB",
          "X-Forwarded-For": "127.0.0.1",
          "X-Request-Id": requestId,
          "X-Client-Id": "tiket123",
          "X-Device-Id": "123",
          "X-Session-Id": "123",
          "User-Agent": "Mozilla/5.0",
          "X-User-Id": "100013863",
          "X-Lang": "id",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          action: "VERIFY_EMAIL",
          channel: "EMAIL",
          recipient: "fajrulalam01@gmail.com",
          recaptchaToken: "",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Generate OTP API request failed with status: ${response.status}`
      );
    }

    const data = await response.json();

    // Implement post-request script logic to extract otpId
    let otpId;
    if (data.data && data.data.otpId) {
      otpId = data.data.otpId;
      console.log("otpId saved:", otpId);
    } else {
      console.log("Token not found in response.");
    }

    return NextResponse.json({
      status: "success",
      message: "OTP generated successfully",
      data: {
        ...data,
        // Pass through important tokens
        loginToken,
        accessToken,
        refreshToken,
        mfaToken,
        // Add extracted otpId
        otpId,
      },
    });
  } catch (error) {
    console.error("Generate OTP API Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while generating OTP",
      },
      { status: 500 }
    );
  }
}
