import axios from "axios";

const defaultBaseURL = "https://core.blnkfinance.com";

function withInstanceId(path: string, instanceId: string): string {
  const url = new URL(path, "http://localhost");
  url.searchParams.set("instance_id", instanceId);
  return `${url.pathname}${url.search}`;
}

export async function blnkGet<T>(
  path: string,
  apiKey: string,
  instanceId: string,
): Promise<T> {
  const requestPath = withInstanceId(path, instanceId);
  const baseURL = process.env.BLNK_CORE_BASE_URL ?? defaultBaseURL;

  try {
    const response = await axios.get<T>(requestPath, {
      baseURL,
      timeout: 9000,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const responseData =
        typeof error.response?.data === "string"
          ? error.response.data
          : JSON.stringify(error.response?.data ?? {});
      throw new Error(
        `Core request failed: GET ${baseURL}${requestPath} -> ${status ?? "no-status"} ${responseData}`,
      );
    }
    throw error;
  }
}

export async function blnkPost<TResponse, TPayload>(
  path: string,
  payload: TPayload,
  apiKey: string,
  instanceId: string,
): Promise<TResponse> {
  const requestPath = withInstanceId(path, instanceId);
  const baseURL = process.env.BLNK_CORE_BASE_URL ?? defaultBaseURL;

  try {
    const response = await axios.post<TResponse>(requestPath, payload, {
      baseURL,
      timeout: 9000,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const responseData =
        typeof error.response?.data === "string"
          ? error.response.data
          : JSON.stringify(error.response?.data ?? {});
      throw new Error(
        `Core request failed: POST ${baseURL}${requestPath} -> ${status ?? "no-status"} ${responseData}`,
      );
    }
    throw error;
  }
}
