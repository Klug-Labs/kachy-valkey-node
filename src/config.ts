/**
 * Configuration module for Kachy Redis client.
 */

export interface KachyConfigOptions {
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  poolSize?: number;
  userAgent?: string;
  headers?: Record<string, string>;
}

export class KachyConfig {
  public readonly accessKey: string;
  public readonly baseUrl: string;
  public readonly timeout: number;
  public readonly maxRetries: number;
  public readonly retryDelay: number;
  public readonly poolSize: number;
  public readonly userAgent: string;
  public readonly headers: Record<string, string>;

  constructor(accessKey: string, options: KachyConfigOptions = {}) {
    if (!accessKey) {
      throw new Error('KACHY_ACCESS_KEY is required');
    }

    this.accessKey = accessKey;
    this.baseUrl = options.baseUrl || process.env['KACHY_BASE_URL'] || 'https://api.klache.net';
    this.timeout = options.timeout || parseInt(process.env['KACHY_TIMEOUT'] || '30', 10);
    this.maxRetries = options.maxRetries || parseInt(process.env['KACHY_MAX_RETRIES'] || '3', 10);
    this.retryDelay = options.retryDelay || parseFloat(process.env['KACHY_RETRY_DELAY'] || '1.0');
    this.poolSize = options.poolSize || parseInt(process.env['KACHY_POOL_SIZE'] || '10', 10);
    this.userAgent = options.userAgent || 'kachy-valkey-node/0.1.0';

    // Set default headers
    this.headers = options.headers || {
      'User-Agent': this.userAgent,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  /**
   * Convert configuration to plain object.
   */
  toObject(): Record<string, any> {
    return {
      accessKey: this.accessKey,
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      maxRetries: this.maxRetries,
      retryDelay: this.retryDelay,
      poolSize: this.poolSize,
      userAgent: this.userAgent,
      headers: { ...this.headers }
    };
  }

  /**
   * Create configuration from environment variables.
   */
  static fromEnv(): KachyConfig {
    const accessKey = process.env['KACHY_ACCESS_KEY'];
    if (!accessKey) {
      throw new Error('KACHY_ACCESS_KEY environment variable is required');
    }

    return new KachyConfig(accessKey);
  }
}
