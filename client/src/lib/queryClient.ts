import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  method: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    // Fallback for POST requests (like creating courses)
    if (method === 'POST' && url.includes('/api/courses') && data) {
      const { localDataManager } = await import('./api-fallback');
      const newCourse = localDataManager.addCourse(data);
      
      return {
        ok: true,
        status: 201,
        json: async () => newCourse,
        text: async () => JSON.stringify(newCourse)
      } as Response;
    }
    
    // Fallback for PUT requests (like updating courses)
    if (method === 'PUT' && url.includes('/api/courses/') && data) {
      const { localDataManager } = await import('./api-fallback');
      const courseId = url.split('/api/courses/')[1];
      const updatedCourse = localDataManager.updateCourse(courseId, data);
      
      return {
        ok: true,
        status: 200,
        json: async () => updatedCourse,
        text: async () => JSON.stringify(updatedCourse)
      } as Response;
    }
    
    // Fallback for DELETE requests (like deleting courses)
    if (method === 'DELETE' && url.includes('/api/courses/')) {
      const { localDataManager } = await import('./api-fallback');
      const courseId = url.split('/api/courses/')[1];
      const result = localDataManager.deleteCourse(courseId);
      
      return {
        ok: true,
        status: 200,
        json: async () => result,
        text: async () => JSON.stringify(result)
      } as Response;
    }

    // For students, always use real API - no localStorage fallback
    
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const res = await fetch(queryKey.join("/") as string, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      // For production, always use real API - no fallback to localStorage
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true, // Refetch when window gains focus
      staleTime: 0, // Always consider data stale
      retry: 1,
    },
    mutations: {
      retry: false,
    },
  },
});
