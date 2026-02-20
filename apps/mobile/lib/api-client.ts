import createClient from "openapi-fetch";
import type { paths } from "@repo/api-types";
import Constants from "expo-constants";

const API_URL =
  Constants.expoConfig?.extra?.apiUrl || "http://localhost:3001";

export const apiClient = createClient<paths>({
  baseUrl: API_URL,
});

export { API_URL };
