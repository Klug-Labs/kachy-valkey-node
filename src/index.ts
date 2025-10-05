/**
 * Kachy Valkey Client
 * 
 * High-performance Valkey client with automatic authentication and multi-tenancy support.
 */

import { KachyClient } from './client';
import { KachyConfig } from './config';
import { KachyPipeline } from './pipeline';

// Re-export main classes
export { KachyClient, KachyError, KachyConnectionError, KachyAuthenticationError, KachyResponseError } from './client';
export { KachyConfig } from './config';
export { KachyPipeline } from './pipeline';

// Global client instance
let globalClient: KachyClient | null = null;

/**
 * Initialize the Kachy client with your access key.
 * 
 * @param accessKey - Your KACHY_ACCESS_KEY for authentication
 * @param options - Additional configuration options
 * @returns The initialized client instance
 */
export function init(accessKey: string, options?: Partial<KachyConfig>): KachyClient {
  const config = new KachyConfig(accessKey, options);
  globalClient = new KachyClient(config);
  return globalClient;
}

/**
 * Get the current Kachy client instance.
 * 
 * @returns The initialized client instance
 * @throws {Error} If client is not initialized
 */
export function getClient(): KachyClient {
  if (!globalClient) {
    throw new Error('Kachy client not initialized. Call kachy.init() first.');
  }
  return globalClient;
}

// Convenience functions that delegate to the global client
export function set(key: string, value: string, ex?: number): Promise<boolean> {
  return getClient().set(key, value, ex);
}

export function get(key: string): Promise<string | null> {
  return getClient().get(key);
}

export function deleteKey(key: string): Promise<boolean> {
  return getClient().delete(key);
}

export function exists(key: string): Promise<boolean> {
  return getClient().exists(key);
}

export function expire(key: string, seconds: number): Promise<boolean> {
  return getClient().expire(key, seconds);
}

export function ttl(key: string): Promise<number> {
  return getClient().ttl(key);
}

export function valkey(command: string, ...args: any[]): Promise<any> {
  return getClient().redis(command, ...args);
}

export function pipeline(): KachyPipeline {
  return getClient().pipeline();
}

export function close(): void {
  if (globalClient) {
    globalClient.close();
    globalClient = null;
  }
}

// Export convenience functions with proper naming
export { deleteKey as delete };
