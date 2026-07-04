// SMS delivery for OTP codes.
// TODO: integrate a real SMS provider (Unifonic / Twilio / Msegat) and read
// its credentials from environment variables. Until then, codes are only
// logged on the server and returned in the API response in development.
export async function sendOtpSms(phone: string, code: string): Promise<void> {
  console.log(`[SMS] OTP for ${phone}: ${code}`);
}
