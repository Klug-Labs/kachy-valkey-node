#!/usr/bin/env node
/**
 * Basic usage example for Kachy Valkey client.
 */

const kachy = require('../dist/index.js');

async function main() {
  try {
    // Initialize the client with your access key
    kachy.init(process.env.KACHY_ACCESS_KEY);
    
    console.log('🚀 Kachy Valkey client initialized!');
    
    // Basic operations
    console.log('\n📝 Setting key-value pairs...');
    await kachy.set('greeting', 'Hello, World!');
    await kachy.set('user:123:name', 'John Doe');
    await kachy.set('session:abc', 'active', 3600); // 1 hour expiration
    
    console.log('✅ Keys set successfully!');
    
    // Retrieving values
    console.log('\n📖 Retrieving values...');
    const greeting = await kachy.get('greeting');
    const userName = await kachy.get('user:123:name');
    const session = await kachy.get('session:abc');
    
    console.log(`Greeting: ${greeting}`);
    console.log(`User name: ${userName}`);
    console.log(`Session: ${session}`);
    
    // Check if keys exist
    console.log('\n🔍 Checking key existence...');
    const existsGreeting = await kachy.exists('greeting');
    const existsNonexistent = await kachy.exists('nonexistent');
    
    console.log(`Greeting exists: ${existsGreeting}`);
    console.log(`Nonexistent key exists: ${existsNonexistent}`);
    
    // Get TTL for session
    console.log('\n⏰ Getting TTL...');
    const ttl = await kachy.ttl('session:abc');
    console.log(`Session TTL: ${ttl} seconds`);
    
    // Custom Valkey commands
    console.log('\n⚡ Using custom Valkey commands...');
    
    // Hash operations
    await kachy.valkey('HMSET', 'user:123:profile', 'age', '30', 'city', 'New York');
    const profile = await kachy.valkey('HMGET', 'user:123:profile', 'age', 'city');
    console.log(`User profile: ${JSON.stringify(profile)}`);
    
    // List operations
    await kachy.valkey('LPUSH', 'notifications:123', 'Welcome message');
    await kachy.valkey('LPUSH', 'notifications:123', 'System update');
    const notifications = await kachy.valkey('LRANGE', 'notifications:123', 0, -1);
    console.log(`Notifications: ${JSON.stringify(notifications)}`);
    
    // Pipeline operations
    console.log('\n🚀 Using pipeline for batch operations...');
    const pipeline = kachy.pipeline();
    pipeline.set('batch:1', 'value1');
    pipeline.set('batch:2', 'value2');
    pipeline.set('batch:3', 'value3');
    const results = await pipeline.execute();
    
    console.log(`Pipeline results: ${JSON.stringify(results)}`);
    
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await kachy.delete('greeting');
    await kachy.delete('user:123:name');
    await kachy.delete('user:123:profile');
    await kachy.delete('notifications:123');
    await kachy.delete('batch:1');
    await kachy.delete('batch:2');
    await kachy.delete('batch:3');
    
    console.log('✅ Cleanup completed!');
    
    // Close connection
    kachy.close();
    console.log('\n👋 Client closed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Check if KACHY_ACCESS_KEY is set
if (!process.env.KACHY_ACCESS_KEY) {
  console.error('❌ KACHY_ACCESS_KEY environment variable is required');
  console.log('Please set it with: export KACHY_ACCESS_KEY="your-access-key-here"');
  process.exit(1);
}

main();
