# Kachy Valkey Node.js Client

High-performance Valkey client with automatic authentication and multi-tenancy support for Node.js.

## Installation

```bash
npm install kachy-valkey
```

## Quick Start

```javascript
const kachy = require('kachy-valkey');

async function main() {
  try {
    // Initialize the client
    kachy.init(process.env.KACHY_ACCESS_KEY);
    
    console.log('🚀 Kachy Valkey client initialized!');
    
    // Basic operations
    await kachy.set('greeting', 'Hello, World!');
    await kachy.set('user:123:name', 'John Doe');
    await kachy.set('session:abc', 'active', 3600); // 1 hour expiration
    
    // Retrieve values
    const greeting = await kachy.get('greeting');
    const userName = await kachy.get('user:123:name');
    const session = await kachy.get('session:abc');
    
    console.log(`Greeting: ${greeting}`);
    console.log(`User name: ${userName}`);
    console.log(`Session: ${session}`);
    
    // Check if keys exist
    const existsGreeting = await kachy.exists('greeting');
    console.log(`Greeting exists: ${existsGreeting}`);
    
    // Get TTL
    const ttl = await kachy.ttl('session:abc');
    console.log(`Session TTL: ${ttl} seconds`);
    
    // Cleanup
    await kachy.delete('greeting');
    await kachy.delete('user:123:name');
    await kachy.delete('session:abc');
    
    // Close connection
    kachy.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
```

## Advanced Operations

### Custom Valkey Commands

```javascript
// Hash operations
await kachy.valkey('HMSET', 'user:123:profile', 'age', '30', 'city', 'New York');
const profile = await kachy.valkey('HMGET', 'user:123:profile', 'age', 'city');
console.log(`User profile: ${JSON.stringify(profile)}`);

// List operations
await kachy.valkey('LPUSH', 'notifications:123', 'Welcome message');
await kachy.valkey('LPUSH', 'notifications:123', 'System update');
const notifications = await kachy.valkey('LRANGE', 'notifications:123', 0, -1);
console.log(`Notifications: ${JSON.stringify(notifications)}`);
```

### Pipeline Operations

```javascript
// Batch operations for better performance
const pipeline = kachy.pipeline();
pipeline.set('batch:1', 'value1');
pipeline.set('batch:2', 'value2');
pipeline.set('batch:3', 'value3');
const results = await pipeline.execute();

console.log(`Pipeline results: ${JSON.stringify(results)}`);
```

## Configuration

Configure the client using environment variables:

- `KACHY_ACCESS_KEY`: Your authentication access key (required)
- `KACHY_BASE_URL`: API base URL (default: https://api.klache.net)
- `KACHY_TIMEOUT`: Request timeout in seconds (default: 30)
- `KACHY_MAX_RETRIES`: Maximum retry attempts (default: 3)
- `KACHY_RETRY_DELAY`: Delay between retries in seconds (default: 1.0)
- `KACHY_POOL_SIZE`: Connection pool size (default: 10)

## API Reference

| Operation | Method | Description |
|-----------|--------|-------------|
| `set` | `await kachy.set(key, value, ex?)` | Set key-value pair with optional expiration |
| `get` | `await kachy.get(key)` | Get value by key |
| `delete` | `await kachy.delete(key)` | Delete a key |
| `exists` | `await kachy.exists(key)` | Check if key exists |
| `expire` | `await kachy.expire(key, seconds)` | Set expiration for key |
| `ttl` | `await kachy.ttl(key)` | Get time to live for key |
| `valkey` | `await kachy.valkey(command, ...args)` | Execute any Valkey command |
| `pipeline` | `kachy.pipeline()` | Create pipeline for batch operations |

## Requirements

- Node.js 16+
- axios ^1.6.0

## Development

```bash
# Clone the repository
git clone https://github.com/Klug-Labs/kachy-valkey-node.git
cd kachy-valkey-node

# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: https://docs.klache.net
- **API Status**: https://status.klache.net
- **Support Email**: support@klache.net