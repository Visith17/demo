import { getServerConfig } from "./constants";

// Types
export interface ApiConfig extends RequestInit {
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

export interface ApiError extends Error {
  status: number;
  data?: any;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Constants
const { API_URL, API_TOKEN } = getServerConfig();

const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

/**
 * API Service for handling HTTP requests
 * Supports authentication, request/response interceptors, and error handling
 */
class ApiService {
  private readonly baseUrl: string;
  private accessToken: string | null;
  private refreshToken: string | null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.accessToken = null;
    this.refreshToken = null;
  }

  /**
   * Initialize tokens from context (SSR)
   */
  public initializeTokensFromContext(accessToken: string | null, refreshToken: string | null): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  /**
   * HTTP GET request
   */
  public async get<T = any>(path: string, config?: ApiConfig): Promise<T> {
    return this.request<T>('GET', path, undefined, config);
  }

  /**
   * HTTP POST request
   */
  public async post<T = any>(path: string, body?: any, config?: ApiConfig): Promise<T> {
    return this.request<T>('POST', path, body, config);
  }

  /**
   * HTTP PUT request
   */
  public async put<T = any>(path: string, body?: any, config?: ApiConfig): Promise<T> {
    return this.request<T>('PUT', path, body, config);
  }

  /**
   * HTTP DELETE request
   */
  public async delete<T = any>(path: string, body:any, config?: ApiConfig): Promise<T> {
    return this.request<T>('DELETE', path, body, config);
  }

  /**
   * HTTP PATCH request
   */
  public async patch<T = any>(path: string, body?: any, config?: ApiConfig): Promise<T> {
    return this.request<T>('PATCH', path, body, config);
  }

  /**
   * Core request method
   */
  private async request<T>(
    method: HttpMethod,
    path: string,
    body?: any,
    config?: ApiConfig
  ): Promise<T> {
    try {
      const headers = await this.getHeaders(config?.skipAuth);
      const url = this.buildUrl(path);
      
      const requestConfig: RequestInit = {
        method,
        headers: { ...headers, ...config?.headers },
        credentials: 'include', // Always include credentials
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

  /**
   * Build request headers
   */
  private async getHeaders(skipAuth?: boolean): Promise<Record<string, string>> {
    const headers = { ...DEFAULT_HEADERS };

    if (!skipAuth) {
      headers['x-access-token'] = this.accessToken || API_TOKEN;
    }
    
    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    
    if (!response.ok) {
      const error: ApiError = new Error('API request failed') as ApiError;
      error.status = response.status;
      
      if (isJson) {
        try {
          error.data = await response.json();
          error.message = error.data.message || error.message;
        } catch {
          // If JSON parsing fails, use status text
          error.message = response.statusText;
        }
      } else {
        error.message = response.statusText;
      }
      
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
        throw new Error('Failed to parse JSON response');
      }
    }

    // Return raw response for non-JSON content
    return response as unknown as T;
  }

  /**
   * Build full URL from path
   */
  private buildUrl(path: string): string {
    const baseUrl = this.baseUrl.endsWith('/')
      ? this.baseUrl.slice(0, -1)
      : this.baseUrl;
    
    const normalizedPath = path.startsWith('/')
      ? path
      : `/${path}`;

    return `${baseUrl}${normalizedPath}`;
  }

  /**
   * Normalize error to ApiError type
   */
  private normalizeError(error: unknown): ApiError {
    if (error instanceof Error) {
      const apiError = error as ApiError;
      apiError.status = apiError.status || 500;
      return apiError;
    }

    const apiError = new Error('Unknown error') as ApiError;
    apiError.status = 500;
    apiError.data = error;
    return apiError;
  }
}

// Create singleton instance
const apiService = new ApiService(API_URL);
export default apiService;