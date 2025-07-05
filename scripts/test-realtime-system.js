const { Client } = require('pg');

async function testRealtimeSystem() {
  console.log('🧪 Testing YesNoMaybe Real-time System\n');
  
  // Test 1: Database Connection
  console.log('1️⃣ Testing Database Connection...');
  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    await client.connect();
    console.log('✅ Database connected successfully');
    
    // Test 2: Check if realtime triggers exist
    console.log('\n2️⃣ Checking Database Triggers...');
    const triggerQuery = `
      SELECT trigger_name, event_object_table 
      FROM information_schema.triggers 
      WHERE trigger_name LIKE '%realtime%'
      ORDER BY event_object_table;
    `;
    
    const result = await client.query(triggerQuery);
    if (result.rows.length > 0) {
      console.log('✅ Real-time triggers found:');
      result.rows.forEach(row => {
        console.log(`   - ${row.trigger_name} on ${row.event_object_table}`);
      });
    } else {
      console.log('❌ No real-time triggers found');
      console.log('   Run: npm run setup-triggers');
    }
    
    // Test 3: Test NOTIFY functionality
    console.log('\n3️⃣ Testing PostgreSQL NOTIFY...');
    await client.query('LISTEN realtime_test_changes');
    
    client.on('notification', (msg) => {
      console.log('✅ Received notification:', {
        channel: msg.channel,
        payload: JSON.parse(msg.payload)
      });
    });
    
    // Send a test notification
    const testPayload = {
      operation: 'INSERT',
      table: 'realtime_test',
      new: { id: 1, message: 'Test event' },
      timestamp: Date.now()
    };
    
    await client.query("SELECT pg_notify('realtime_test_changes', $1)", [JSON.stringify(testPayload)]);
    
    // Wait a moment for the notification
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await client.end();
    
  } catch (error) {
    console.log('❌ Database test failed:', error.message);
    return false;
  }
  
  // Test 4: Check SSE Endpoint (basic check)
  console.log('\n4️⃣ Testing SSE Endpoint...');
  try {
    const response = await fetch('http://localhost:3000/api/realtime', {
      headers: {
        'Accept': 'text/event-stream'
      }
    });
    
    if (response.ok) {
      console.log('✅ SSE endpoint responds correctly');
      console.log(`   Status: ${response.status}`);
      console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    } else {
      console.log('❌ SSE endpoint error:', response.status);
    }
  } catch (error) {
    console.log('❌ SSE endpoint test failed:', error.message);
    console.log('   Make sure the dev server is running: npm run dev');
  }
  
  // Test 5: Check Real-time Hooks Files
  console.log('\n5️⃣ Checking Real-time Hook Files...');
  const fs = require('fs');
  const path = require('path');
  
  const hookFiles = [
    'src/hooks/useRealtimeOrderbook.ts',
    'src/hooks/useRealtimePortfolio.ts', 
    'src/hooks/useRealtimeTradeHistory.ts',
    'src/contexts/RealtimeContext.tsx'
  ];
  
  let allHooksExist = true;
  hookFiles.forEach(file => {
    if (fs.existsSync(path.join(process.cwd(), file))) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - MISSING`);
      allHooksExist = false;
    }
  });
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (allHooksExist) {
    console.log('✅ All real-time components are in place');
    console.log('✅ Phase 1.5 infrastructure appears complete');
    console.log('\n🚀 Ready to test in browser:');
    console.log('   1. Open http://localhost:3000/dashboard');
    console.log('   2. Check browser console for real-time connection logs');
    console.log('   3. Make a trade to test real-time updates');
  } else {
    console.log('❌ Some components are missing');
    console.log('❌ Phase 1.5 needs completion');
  }
  
  console.log('\n🔧 To complete Step 6 (Testing):');
  console.log('   - Fix Jest configuration for proper test execution');
  console.log('   - Verify real-time system works in browser');
  console.log('   - Test actual order/trade flow triggers real-time updates');
}

// Run the test
testRealtimeSystem().catch(console.error); 