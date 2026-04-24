export const baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:2222/api"
    : "https://api.squareexp.com/api";

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
};

export async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, headers, ...customConfig } = options;

  let uri = `${baseURL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    uri += `?${searchParams.toString()}`;
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  const response = await fetch(uri, config);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  // Not all API responses have JSON
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}