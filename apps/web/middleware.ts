import { NextRequest, NextResponse } from "next/server";

const basicAuth = Buffer.from(
  `${process.env.AUTH_USER}:${process.env.AUTH_PASS}`
).toString("base64");

export function middleware(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (authHeader === `Basic ${basicAuth}`) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
