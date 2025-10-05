/**
 * Main client module for Kachy Redis.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { KachyConfig } from './config';
import { KachyPipeline } from './pipeline';

export class KachyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KachyError';
  }
}

export class KachyConnectionError extends KachyError {
  constructor(message: string) {
    super(message);
    this.name = 'KachyConnectionError';
  }
}

export class KachyAuthenticationError extends KachyError {
  constructor(message: string) {
    super(message);
    this.name = 'KachyAuthenticationError';
  }
}

export class KachyResponseError extends KachyError {
  constructor(message: string) {
    super(message);
    this.name = 'KachyResponseError';
  }
}

export class KachyClient {
  private readonly config: KachyConfig;
  private readonly httpClient: AxiosInstance;

  constructor(config: KachyConfig) {
    this.config = config;
    this.httpClient = this.createHttpClient();
  }

  /**
   * Create and configure the HTTP client.
   */
  private createHttpClient(): AxiosInstance {
    const client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout * 1000,
      headers: this.config.headers
    });

    // Add request interceptor for authentication
    client.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${this.config.accessKey}`;
      return config;
    });

    // Add response interceptor for error handling
    client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          throw new KachyAuthenticationError('Authentication failed');
        } else if (error.response?.status >= 400) {
          throw new KachyResponseError(
            `API error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`
          );
        } else if (error.code === 'ECONNABORTED') {
          throw new KachyConnectionError('Request timeout');
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
          throw new KachyConnectionError('Connection failed');
        } else {
          throw new KachyConnectionError(`Request failed: ${error.message}`);
        }
      }
    );

    return client;
  }


  /**
   * Make an HTTP request to the Kachy API.
   */
  private async makeRequest<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.httpClient.request(config);
      return response.data;
    } catch (error) {
      // Error handling is done in the interceptor
      throw error;
    }
  }

  /**
   * Set a key-value pair with optional expiration.
   */
  async set(key: string, value: string, ex?: number): Promise<boolean> {
    const data: any = { key, value };
    if (ex !== undefined) {
      data.ex = ex;
    }

    const result = await this.makeRequest<{ success: boolean }>({
      method: 'POST',
      url: '/valkey/set',
      data
    });

    return result.success;
  }

  /**
   * Get a value by key.
   */
  async get(key: string): Promise<string | null> {
    const result = await this.makeRequest<{ value: string | null }>({
      method: 'GET',
      url: `/valkey/get/${encodeURIComponent(key)}`
    });

    return result.value;
  }

  /**
   * Delete a key.
   */
  async delete(key: string): Promise<boolean> {
    const result = await this.makeRequest<{ deleted: boolean }>({
      method: 'DELETE',
      url: `/valkey/del/${encodeURIComponent(key)}`
    });

    return result.deleted;
  }

  /**
   * Check if a key exists.
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.makeRequest<{ exists: boolean }>({
      method: 'GET',
      url: `/valkey/exists/${encodeURIComponent(key)}`
    });

    return result.exists;
  }

  /**
   * Set expiration for a key.
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    const result = await this.makeRequest<{ success: boolean }>({
      method: 'POST',
      url: '/valkey/expire',
      data: { key, seconds }
    });

    return result.success;
  }

  /**
   * Get time to live for a key.
   */
  async ttl(key: string): Promise<number> {
    const result = await this.makeRequest<{ ttl: number }>({
      method: 'GET',
      url: `/valkey/ttl/${encodeURIComponent(key)}`
    });

    return result.ttl;
  }

  /**
   * Execute any Redis command.
   */
  async redis(command: string, ...args: any[]): Promise<any> {
    const result = await this.makeRequest<{ result: any }>({
      method: 'POST',
      url: '/valkey/exec',
      data: {
        command: command.toUpperCase(),
        args
      }
    });

    return result.result;
  }

  /**
   * Create a pipeline for batch operations.
   */
  pipeline(): KachyPipeline {
    return new KachyPipeline(this);
  }

  /**
   * Close the connection and cleanup resources.
   */
  close(): void {
    // Axios doesn't have a close method, cleanup is automatic
  }
}
