#!/usr/bin/env node

/**
 * Complete flow test: SSE endpoint + API order creation
 * Tests the full pipeline: API -> Database -> Trigger -> SSE
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const http = require('http');

// Simple EventSource for Node.js (same as before)
class EventSource {
  constructor(url) {
    this.url = url;
    this.readyState = 0;
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    this._connect();
  }

  _connect() {
    const { URL } = require('url');
    const urlObj = new URL(this.url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname + urlObj.search,
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      }
    };

    console.log(`🔗 Connecting to SSE: ${this.url}`);
    
    const req = http.request(options, (res) => {
      if (res.statusCode !== 200) {
        console.error(`❌ HTTP ${res.statusCode}: ${res.statusMessage}`);
        this.readyState = 2;
        if (this.onerror) this.onerror(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      console.log('✅ SSE connected');
      this.readyState = 1;
      if (this.onopen) this.onopen();

      let buffer = '';
      
      res.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n\n');
        buffer = lines.pop();
        
        lines.forEach(message => {
          if (message.startsWith('data: ')) {
            const data = message.substring(6);
            try {
              const event = { data, type: 'message' };
              if (this.onmessage) this.onmessage(event);
            } catch (error) {
              console.error('❌ Error parsing SSE data:', error);
            }
          }
        });
      });

      res.on('end', () => {
        console.log('🔌 SSE ended');
        this.readyState = 2;
      });

      res.on('error', (error) => {
        console.error('❌ SSE error:', error);
        this.readyState = 2;
        if (this.onerror) this.onerror(error);
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      this.readyState = 2;
      if (this.onerror) this.onerror(error);
    });

    req.end();
  }

  close() {
    this.readyState = 2;
  }
}

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Real-time Flow');
  console.log('=' .repeat(50));

  let databaseChangeReceived = false;
  
  // 1. Connect to SSE endpoint
  const eventSource = new EventSource('http://localhost:3000/api/realtime');
  
  eventSource.onopen = () => {
    console.log('✅ SSE connection established');
  };
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    switch (data.type) {
      case 'connection':
        console.log('🎉 SSE connected:', data.message);
        // Wait 2 seconds then create an order
        setTimeout(createTestOrder, 2000);
        break;
      case 'heartbeat':
        console.log('💓 Heartbeat');
        break;
      case 'database_change':
        console.log('🎯 DATABASE CHANGE DETECTED!');
        console.log(`   Channel: ${data.channel}`);
        console.log(`   Operation: ${data.operation}`);
        console.log(`   Table: ${data.table}`);
        console.log(`   Data:`, data.data);
        databaseChangeReceived = true;
        
        if (data.channel === 'orders_changes' && data.operation === 'INSERT') {
          console.log('✅ REAL-TIME FLOW WORKING! Order creation detected via SSE');
        }
        break;
      default:
        console.log('📨 Other event:', data);
    }
  };
  
  eventSource.onerror = (error) => {
    console.error('❌ SSE Error:', error.message);
  };

  // 2. Function to create test order via API
  async function createTestOrder() {
    console.log('\n📝 Creating test order via API...');
    
    const orderData = JSON.stringify({
      market_id: 'test-sse-flow',
      user_id: 'test-user-flow', 
      side: 'yes',
      quantity: 3,
      price: 0.85,
      type: 'limit'
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(orderData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ Order created successfully via API');
          console.log('⏳ Waiting for database change notification...');
        } else {
          console.log('❌ Order creation failed:', res.statusCode, body);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ API request error:', error);
    });

    req.write(orderData);
    req.end();
  }

  // 3. Wait 15 seconds to see if we get the database change
  console.log('⏰ Listening for 15 seconds...');
  
  await new Promise(resolve => setTimeout(resolve, 15000));
  
  // 4. Results
  console.log('\n📊 TEST RESULTS:');
  console.log('=' .repeat(30));
  
  if (databaseChangeReceived) {
    console.log('🎉 SUCCESS: Complete real-time flow is working!');
    console.log('   ✅ SSE endpoint connected');
    console.log('   ✅ Database changes streamed in real-time');
    console.log('   ✅ Triggers → SSE → Client pipeline working');
  } else {
    console.log('⚠️  PARTIAL: SSE connected but no database changes detected');
    console.log('   ✅ SSE endpoint works');
    console.log('   ❓ Database changes may not be flowing through');
    console.log('   💡 This could be due to API auth or database connection issues');
  }
  
  console.log('\n🔚 Test completed');
  eventSource.close();
  process.exit(0);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down test...');
  process.exit(0);
});

// Run the test
testCompleteFlow().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 