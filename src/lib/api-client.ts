import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<void> | null = null;
  private isLoggedOut: boolean = false;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Send cookies with every request
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        // Cookies are sent automatically with withCredentials: true
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token expiration and refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Don't attempt to refresh on failed login/register attempts (401 from auth endpoints)
        const url = originalRequest.url || '';
        const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh') || url.includes('/auth/logout') || url.includes('/auth/me');

        // Don't try to refresh if we just logged out
        if (this.isLoggedOut) {
          return Promise.reject(error);
        }

        // If 401 during an authorized request (not a failed login), the access token has expired
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
          originalRequest._retry = true;

          try {
            // If a refresh is already in progress, wait for it to complete
            if (this.refreshPromise) {
              await this.refreshPromise;
            } else {
              // Start a new refresh process
              this.refreshPromise = this.performTokenRefresh();
              await this.refreshPromise;
            }

            // After refresh completes, retry the original request
            return this.client(originalRequest);
          } catch (refreshError: any) {
            // Refresh failed - could be no refresh token or token expired
            // Only redirect to login if not already on the login page AND not calling /auth/me
            const url = originalRequest.url || '';
            const isAuthMeEndpoint = url.includes('/auth/me');
            
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !isAuthMeEndpoint) {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          } finally {
            // Clear the refresh promise so future requests can trigger a new refresh if needed
            this.refreshPromise = null;
          }
        }

        // Don't log 401 errors for auth endpoints - they're expected
        if (error.response?.status === 401 && isAuthEndpoint) {
          // Silently reject without logging
          return Promise.reject(error);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Mark the client as logged out to prevent token refresh attempts
   */
  markLoggedOut() {
    this.isLoggedOut = true;
  }

  /**
   * Mark the client as logged in to enable token refresh again
   */
  markLoggedIn() {
    this.isLoggedOut = false;
  }

  /**
   * Performs the actual token refresh by calling the refresh endpoint
   * Uses a separate axios instance to avoid interceptor loops
   */
  private async performTokenRefresh(): Promise<void> {
    try {
      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        {},
        { 
          withCredentials: true,
          timeout: 10000, // 10 second timeout
        }
      );
      return response.data;
    } catch (error: any) {
      // Silently fail for 401/403 - user is not authenticated
      // Only log other types of errors
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        // Don't log expected auth errors
      }
      throw error;
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
