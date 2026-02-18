import createClient from "openapi-fetch";
import type { paths } from "@repo/api-types";

export function createAuthClient(accessToken: string) {
  return createClient<paths>({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
