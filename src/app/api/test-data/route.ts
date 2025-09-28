import { NextResponse } from "next/server";


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
