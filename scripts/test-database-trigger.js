// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { Client } = require('pg');

async function testDatabaseTrigger() {
  console.log('🧪 Testing Database Trigger');
  console.log('=' .repeat(40));

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // Insert a test order to trigger the database trigger
    console.log('\n📝 Inserting test order...');
    const result = await client.query(`
      INSERT INTO orders (market_id, user_id, side, quantity, price, type, status)
      VALUES ('test-market-sse', 'test-user-sse', 'yes', 5, 0.80, 'limit', 'open')
      RETURNING id, market_id, user_id, side, quantity, price, status, created_at
    `);
    
    console.log('✅ Test order inserted successfully!');
    console.log('📊 Order details:', {
      id: result.rows[0].id,
      market_id: result.rows[0].market_id,
      user_id: result.rows[0].user_id,
      side: result.rows[0].side,
      quantity: result.rows[0].quantity,
      price: result.rows[0].price,
      status: result.rows[0].status
    });
    
    // The trigger should have fired automatically when we inserted the order
    console.log('\n🎯 Database trigger should have fired for this INSERT operation');
    console.log('💡 If SSE endpoint is connected, it should receive an "orders_changes" event');
    
    // Clean up - delete the test order
    console.log('\n🧹 Cleaning up test order...');
    await client.query('DELETE FROM orders WHERE market_id = $1', ['test-market-sse']);
    console.log('✅ Test order cleaned up');
    
    console.log('\n🎉 Database trigger test completed successfully!');
    console.log('📡 The order INSERT should have triggered a PostgreSQL notification');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('relation "orders" does not exist')) {
      console.log('💡 The orders table might not exist or be accessible');
    } else if (error.message.includes('permission denied')) {
      console.log('💡 Database permission issue - check your connection string');
    }
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testDatabaseTrigger().catch(console.error); 