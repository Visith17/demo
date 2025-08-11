// apiService.ts for client side
'use client';

// Types
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiConfig extends RequestInit {
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

interface ApiError extends Error {
  status: number;
  data?: unknown;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

// Constants
const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL!;

const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

/**
 * Client-side API service for handling HTTP requests
 */
class ApiService {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    if (!baseUrl) {
      throw new Error('API base URL is required');
    }
    this.baseUrl = baseUrl;
  }

  /** HTTP Methods */
  public async get<T>(path: string, config?: ApiConfig): Promise<T> {
    return this.request<T>('GET', path, undefined, config);
  }

  public async post<T>(path: string, body?: unknown, config?: ApiConfig): Promise<T> {
    return this.request<T>('POST', path, body, config);
  }

  public async put<T>(path: string, body?: unknown, config?: ApiConfig): Promise<T> {
    return this.request<T>('PUT', path, body, config);
  }

  public async delete<T>(path: string, config?: ApiConfig): Promise<T> {
    return this.request<T>('DELETE', path, undefined, config);
  }

  public async patch<T>(path: string, body?: unknown, config?: ApiConfig): Promise<T> {
    return this.request<T>('PATCH', path, body, config);
  }

  /** Core request logic */
  private async request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    config?: ApiConfig
  ): Promise<T> {
    try {
      const url = this.buildUrl(path);
      const headers = this.buildHeaders(config?.headers);
      
      const requestConfig: RequestInit = {
        method,
        credentials: 'include',
        headers,
        ...config,
      };

      if (body !== undefined) {
        requestConfig.body = JSON.stringify(body);
      }

      const response = await fetch(url, requestConfig);
      return this.handleResponse<T>(response);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /** Build complete URL */
  private buildUrl(path: string): string {
    const baseUrl = this.baseUrl.endsWith('/')
      ? this.baseUrl.slice(0, -1)
      : this.baseUrl;
    
    const normalizedPath = path.startsWith('/')
      ? path
      : `/${path}`;

    return `${baseUrl}${normalizedPath}`;
  }

  /** Build request headers */
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    return {
      ...DEFAULT_HEADERS,
      ...customHeaders,
    };
  }

  /** Handle API response */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      const error = this.createApiError(
        'Request failed',
        response.status,
        isJson ? await response.json().catch(() => ({})) : undefined
      );
      throw error;
    }

    // Handle empty responses
    if (response.status === 204) {
      return {} as T;
    }

    // Parse JSON response
    if (isJson) {
      try {
        return await response.json();
      } catch (error) {
        throw this.createApiError('Failed to parse JSON response', 500);
      }
    }

    // Return raw response for non-JSON content
    return response as unknown as T;
  }

  /** Create standardized API error */
  private createApiError(message: string, status: number, data?: unknown): ApiError {
    const error = new Error(message) as ApiError;
    error.status = status;
    error.data = data;
    return error;
  }

  /** Normalize unknown errors to ApiError format */
  private normalizeError(error: unknown): ApiError {
    if (error instanceof Error) {
      const apiError = error as ApiError;
      apiError.status = apiError.status || 500;
      return apiError;
    }

    return this.createApiError(
      'An unexpected error occurred',
      500,
      error
    );
  }
}

// Create singleton instance
const apiService = new ApiService(NEXT_PUBLIC_API_URL);
export default apiService;
