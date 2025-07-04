const { Client } = require('pg')

async function testConnection() {
  console.log('🧪 Testing PostgreSQL Connection for Realtime')
  console.log('=' .repeat(50))

  // Check environment variables
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL
  
  if (!connectionString) {
    console.log('❌ No DATABASE_URL or POSTGRES_URL found in environment')
    console.log('💡 Please set one of these environment variables:')
    console.log('   For Supabase: postgresql://postgres:[PASSWORD]@db.cyrnkrvlxvoufvazmgqf.supabase.co:5432/postgres')
    console.log('   (Replace [PASSWORD] with your Supabase database password)')
    return
  }

  console.log('✅ Database connection string found')
  console.log('🔗 Connecting to:', connectionString.replace(/:[^:@]*@/, ':***@'))

  const client = new Client({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  })

  try {
    // Test basic connection
    console.log('\n1️⃣ Testing basic connection...')
    await client.connect()
    console.log('✅ Connected successfully!')

    // Test LISTEN capability
    console.log('\n2️⃣ Testing LISTEN capability...')
    await client.query('LISTEN test_channel')
    console.log('✅ LISTEN command successful!')

    // Set up notification handler
    let notificationReceived = false
    client.on('notification', (notification) => {
      console.log('\n📡 Notification received:', notification)
      notificationReceived = true
    })

    // Test NOTIFY
    console.log('\n3️⃣ Testing NOTIFY...')
    await client.query("SELECT pg_notify('test_channel', 'Hello from test!')")
    
    // Wait a moment for notification
    await new Promise(resolve => setTimeout(resolve, 100))
    
    if (notificationReceived) {
      console.log('✅ NOTIFY/LISTEN working correctly!')
    } else {
      console.log('⚠️  NOTIFY sent but notification not received (might be timing)')
    }

    // Test our actual channels
    console.log('\n4️⃣ Testing realtime channels...')
    const channels = ['orders_changes', 'trades_changes', 'user_balances_changes', 'markets_changes']
    
    for (const channel of channels) {
      await client.query(`LISTEN ${channel}`)
      console.log(`   👂 Listening to: ${channel}`)
    }
    
    console.log('✅ All realtime channels set up!')
    console.log('\n🎉 PostgreSQL realtime setup is working!')
    console.log('\n💡 Next steps:')
    console.log('   - The database triggers should now send notifications')
    console.log('   - Try inserting an order to test the system')

  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Authentication error - check your database password')
      console.log('   You can find it in your Supabase project settings')
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('\n💡 DNS error - check your database host')
    }
  } finally {
    await client.end()
    console.log('\n🔌 Connection closed')
  }
}

// Run the test
testConnection().catch(console.error) 