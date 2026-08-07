import { NextRequest, NextResponse } from "next/server";

// BASIC認証を無効化
// const basicAuth = Buffer.from(
//   `${process.env.AUTH_USER}:${process.env.AUTH_PASS}`
// ).toString("base64");

export function middleware(_req: NextRequest) {
  // const authHeader = _req.headers.get("authorization");

  // if (authHeader === `Basic ${basicAuth}`) {
  //   return NextResponse.next();
  // }

  // return new NextResponse("Authentication required", {
  //   status: 401,
  //   headers: {
  //     "WWW-Authenticate": 'Basic realm="Secure Area"',
  //   },
  // });

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
