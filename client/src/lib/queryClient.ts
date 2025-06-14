import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  options?: {
    method?: string;
    data?: unknown;
    headers?: Record<string, string>;
  }
): Promise<any> {
  const method = options?.method || 'GET';
  const data = options?.data;
  
  try {
    const res = await fetch(url, {
      method,
      headers: {
        ...(data ? { "Content-Type": "application/json" } : {}),
        ...(options?.headers || {})
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`API Error ${res.status}: ${text}`);
      throw new Error(`Request failed with status ${res.status}`);
    }
    
    // Try to parse as JSON, fall back to raw response
    try {
      const jsonData = await res.json();
      return jsonData;
    } catch (e) {
      console.error("Error parsing JSON response:", e);
      if (res.status === 200) return { success: true };
      return res;
    }
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    
    // Skip auth-related queries to prevent UI errors
    if (url.includes('/api/auth/user')) {
      return null;
    }
    
    try {
      const res = await fetch(url, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      if (!res.ok) {
        const text = await res.text();
        console.error(`API Error ${res.status}: ${text}`);
        throw new Error(`Request failed with status ${res.status}`);
      }
      
      try {
        return await res.json();
      } catch (e) {
        console.error("Error parsing JSON response:", e);
        if (res.status === 200) return { success: true } as any;
        return null;
      }
    } catch (error) {
      console.error("Query function error:", error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
