#!/usr/bin/env node

/**
 * Test script for SSE endpoint
 * Tests the /api/realtime endpoint to ensure it streams database changes
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const fs = require('fs');

// Simple EventSource polyfill for Node.js
class EventSource {
  constructor(url) {
    this.url = url;
    this.readyState = 0; // CONNECTING
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    this.listeners = {};
    
    this._connect();
  }

  _connect() {
    const https = require('https');
    const http = require('http');
    const { URL } = require('url');
    
    const urlObj = new URL(this.url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      }
    };

    console.log(`🔗 Connecting to SSE endpoint: ${this.url}`);
    
    const req = client.request(options, (res) => {
      if (res.statusCode !== 200) {
        console.error(`❌ HTTP ${res.statusCode}: ${res.statusMessage}`);
        this.readyState = 2; // CLOSED
        if (this.onerror) this.onerror(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      console.log('✅ Connected to SSE endpoint');
      this.readyState = 1; // OPEN
      if (this.onopen) this.onopen();

      let buffer = '';
      
      res.on('data', (chunk) => {
        buffer += chunk.toString();
        
        // Process complete messages
        const lines = buffer.split('\n\n');
        buffer = lines.pop(); // Keep incomplete message in buffer
        
        lines.forEach(message => {
          if (message.startsWith('data: ')) {
            const data = message.substring(6);
            try {
              const event = { data, type: 'message' };
              console.log('📨 Received SSE event:', JSON.parse(data));
              if (this.onmessage) this.onmessage(event);
            } catch (error) {
              console.error('❌ Error parsing SSE data:', error);
            }
          }
        });
      });

      res.on('end', () => {
        console.log('🔌 SSE connection ended');
        this.readyState = 2; // CLOSED
      });

      res.on('error', (error) => {
        console.error('❌ SSE connection error:', error);
        this.readyState = 2; // CLOSED
        if (this.onerror) this.onerror(error);
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      this.readyState = 2; // CLOSED
      if (this.onerror) this.onerror(error);
    });

    req.end();
  }

  close() {
    this.readyState = 2; // CLOSED
  }
}

async function testSSEEndpoint() {
  console.log('🧪 Testing SSE Endpoint');
  console.log('='.repeat(50));

  // Test local development server
  const testUrl = 'http://localhost:3000/api/realtime';
  
  console.log('1. Testing SSE connection...');
  
  const eventSource = new EventSource(testUrl);
  
  eventSource.onopen = () => {
    console.log('✅ SSE connection established');
  };
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    switch (data.type) {
      case 'connection':
        console.log('🎉 Connection confirmed:', data.message);
        break;
      case 'heartbeat':
        console.log('💓 Heartbeat received');
        break;
      case 'database_change':
        console.log(`📊 Database change detected:`);
        console.log(`   Channel: ${data.channel}`);
        console.log(`   Operation: ${data.operation}`);
        console.log(`   Table: ${data.table}`);
        console.log(`   Data:`, data.data);
        break;
      default:
        console.log('📨 Unknown event type:', data);
    }
  };
  
  eventSource.onerror = (error) => {
    console.error('❌ SSE Error:', error.message);
  };

  // Keep connection open for 30 seconds to test
  console.log('⏰ Listening for events for 30 seconds...');
  console.log('💡 Try creating an order in another terminal to test database changes!');
  console.log('   Example: Insert a test order via Supabase dashboard or API');
  
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  console.log('🔚 Test completed');
  eventSource.close();
  process.exit(0);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down SSE test...');
  process.exit(0);
});

// Run the test
testSSEEndpoint().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 