/**
 * Basic tests for Kachy Redis client.
 */

import { KachyClient, KachyConfig, KachyError } from '../src/client';

// Mock axios
jest.mock('axios');
const mockAxios = require('axios');

describe('KachyClient', () => {
  let client: KachyClient;
  let config: KachyConfig;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create test config
    config = new KachyConfig('test-secret', {
      baseUrl: 'https://test.api.kachy.com',
      timeout: 10
    });
    
    // Create client
    client = new KachyClient(config);
  });

  afterEach(() => {
    client.close();
  });

  describe('constructor', () => {
    it('should create client with config', () => {
      expect(client).toBeInstanceOf(KachyClient);
    });
  });

  describe('set', () => {
    it('should set key-value pair without expiration', async () => {
      const mockResponse = { data: { success: true } };
      mockAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await client.set('test-key', 'test-value');
      
      expect(result).toBe(true);
    });

    it('should set key-value pair with expiration', async () => {
      const mockResponse = { data: { success: true } };
      mockAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await client.set('test-key', 'test-value', 3600);
      
      expect(result).toBe(true);
    });
  });

  describe('get', () => {
    it('should get value by key', async () => {
      const mockResponse = { data: { value: 'test-value' } };
      mockAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await client.get('test-key');
      
      expect(result).toBe('test-value');
    });

    it('should return null for non-existent key', async () => {
      const mockResponse = { data: { value: null } };
      mockAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await client.get('non-existent');
      
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete existing key', async () => {
      const mockResponse = { data: { deleted: true } };
      mockAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await client.delete('test-key');
      
      expect(result).toBe(true);
    });

    it('should return false for non-existent key', async () => {
      const mockResponse = { data: { deleted: false } };
      mockAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await client.delete('non-existent');
      
      expect(result).toBe(false);
    });
  });

  describe('exists', () => {
    it('should check if key exists', async () => {
      const mockResponse = { data: { exists: true } };
      mockAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await client.exists('test-key');
      
      expect(result).toBe(true);
    });
  });

  describe('expire', () => {
    it('should set expiration for key', async () => {
      const mockResponse = { data: { success: true } };
      mockAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await client.expire('test-key', 3600);
      
      expect(result).toBe(true);
    });
  });

  describe('ttl', () => {
    it('should get TTL for key', async () => {
      const mockResponse = { data: { ttl: 1800 } };
      mockAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await client.ttl('test-key');
      
      expect(result).toBe(1800);
    });
  });

  describe('redis', () => {
    it('should execute custom Redis command', async () => {
      const mockResponse = { data: { result: ['value1', 'value2'] } };
      mockAxios.create.mockReturnValue({
        request: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await client.redis('HMGET', 'hash-key', 'field1', 'field2');
      
      expect(result).toEqual(['value1', 'value2']);
    });
  });

  describe('pipeline', () => {
    it('should create pipeline instance', () => {
      const pipeline = client.pipeline();
      
      expect(pipeline).toBeDefined();
      expect(typeof pipeline.execute).toBe('function');
    });
  });

  describe('close', () => {
    it('should close client connection', () => {
      client.close();
      
      // In this implementation, close just clears the token
      // You might want to add more cleanup logic
      expect(client).toBeDefined();
    });
  });
});

describe('KachyConfig', () => {
  it('should create config with required secret', () => {
    const config = new KachyConfig('test-secret');
    
    expect(config.secret).toBe('test-secret');
    expect(config.baseUrl).toBe('https://api.kachy.com');
    expect(config.timeout).toBe(30);
  });

  it('should create config with custom options', () => {
    const config = new KachyConfig('test-secret', {
      baseUrl: 'https://custom.api.kachy.com',
      timeout: 60
    });
    
    expect(config.baseUrl).toBe('https://custom.api.kachy.com');
    expect(config.timeout).toBe(60);
  });

  it('should throw error for empty secret', () => {
    expect(() => {
      new KachyConfig('');
    }).toThrow('KACHY_SECRET is required');
  });

  it('should create config from environment variables', () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      KACHY_SECRET: 'env-secret',
      KACHY_BASE_URL: 'https://env.api.kachy.com'
    };

    const config = KachyConfig.fromEnv();
    
    expect(config.secret).toBe('env-secret');
    expect(config.baseUrl).toBe('https://env.api.kachy.com');

    // Restore original env
    process.env = originalEnv;
  });
});
