import axios, { AxiosInstance } from "axios";

export function createApiClient(token: string): AxiosInstance {
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000",
    timeout: 10000,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
