import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({
    status: "success",
    message: "Test Data API is running",
    endpoints: [
      "session",
      "login",
      "mfaMethods",
      "generateOtp",
      "verifyOtp",
      "submitMfa",
      "verifyAuthCode",
      "serviceTicket",
      "activeOrderList",
      "hotelRoom",
      "hotelPrebook",
      "hotelBook",
      "paymentDetail",
    ],
  });
}
