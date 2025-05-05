import { QueryClient } from '@tanstack/react-query';

// Create a query client instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

interface ApiRequestOptions extends RequestInit {
  headers?: HeadersInit;
}

// Helper function to make API requests
export async function apiRequest(
  endpoint: string,
  options: ApiRequestOptions = {}
) {
  // Make sure endpoint starts with /
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Default options
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Important for cookies/sessions
  };

  // If data is provided and method is not GET, stringify it
  if (options.body && typeof options.body === 'object') {
    fetchOptions.body = JSON.stringify(options.body);
  }

  try {
    // Make the request
    const response = await fetch(path, fetchOptions);
    
    // Check for HTTP errors
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP error ${response.status}`,
      }));
      throw new Error(error.message || `HTTP error ${response.status}`);
    }
    
    // Parse JSON response if content exists
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return response;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}