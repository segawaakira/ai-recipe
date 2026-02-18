import createClient from "openapi-fetch";
import type { paths } from "@repo/api-types";
import { API_URL } from "./api-client";

export function createAuthClient(accessToken: string) {
  return createClient<paths>({
    baseUrl: API_URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
