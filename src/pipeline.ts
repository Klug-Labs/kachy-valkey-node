/**
 * Pipeline module for batch Redis operations.
 */

import { KachyClient } from './client';

export interface PipelineCommand {
  command: string;
  args: any[];
}

export class KachyPipeline {
  private readonly client: KachyClient;
  private readonly commands: PipelineCommand[] = [];

  constructor(client: KachyClient) {
    this.client = client;
  }

  /**
   * Add SET command to pipeline.
   */
  set(key: string, value: string, ex?: number): this {
    this.commands.push({
      command: 'SET',
      args: ex !== undefined ? [key, value, ex] : [key, value]
    });
    return this;
  }

  /**
   * Add GET command to pipeline.
   */
  get(key: string): this {
    this.commands.push({
      command: 'GET',
      args: [key]
    });
    return this;
  }

  /**
   * Add DELETE command to pipeline.
   */
  delete(key: string): this {
    this.commands.push({
      command: 'DEL',
      args: [key]
    });
    return this;
  }

  /**
   * Add EXISTS command to pipeline.
   */
  exists(key: string): this {
    this.commands.push({
      command: 'EXISTS',
      args: [key]
    });
    return this;
  }

  /**
   * Add EXPIRE command to pipeline.
   */
  expire(key: string, seconds: number): this {
    this.commands.push({
      command: 'EXPIRE',
      args: [key, seconds]
    });
    return this;
  }

  /**
   * Add TTL command to pipeline.
   */
  ttl(key: string): this {
    this.commands.push({
      command: 'TTL',
      args: [key]
    });
    return this;
  }

  /**
   * Add custom Redis command to pipeline.
   */
  redis(command: string, ...args: any[]): this {
    this.commands.push({
      command: command.toUpperCase(),
      args
    });
    return this;
  }

  /**
   * Execute all commands in the pipeline.
   */
  async execute(): Promise<any[]> {
    if (this.commands.length === 0) {
      return [];
    }

    try {
      // Execute all commands in a single batch request
      // For now, we'll execute commands individually in sequence
      const results: any[] = [];
      
      for (const cmd of this.commands) {
        try {
          const result = await this.client.redis(cmd.command, ...cmd.args);
          results.push(result);
        } catch (error: any) {
          results.push({ error: error.message });
        }
      }

      // Clear commands after execution
      this.commands.length = 0;

      return results;
    } catch (error) {
      // Clear commands on error
      this.commands.length = 0;
      throw error;
    }
  }

  /**
   * Clear all pending commands without executing them.
   */
  clear(): this {
    this.commands.length = 0;
    return this;
  }

  /**
   * Get the number of pending commands.
   */
  get length(): number {
    return this.commands.length;
  }
}
