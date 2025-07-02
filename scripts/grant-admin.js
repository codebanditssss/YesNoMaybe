/**
 * Script to grant admin role to a user for testing
 * Usage: node scripts/grant-admin.js <user-email>
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function grantAdminRole(email) {
  try {
    console.log(`🔍 Looking up user: ${email}`);
    
    // Get user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }
    
    const user = users.find(u => u.email === email);
    
    if (!user) {
      console.error(`❌ User not found: ${email}`);
      console.log('💡 Available users:');
      users.forEach(u => console.log(`   - ${u.email} (${u.id})`));
      process.exit(1);
    }
    
    console.log(`✅ Found user: ${user.email} (${user.id})`);
    
    // Update user metadata to include admin role
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        role: 'admin'
      }
    });
    
    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
    
    console.log(`🎉 Successfully granted admin role to ${email}`);
    console.log(`📋 User details:`, {
      id: data.user.id,
      email: data.user.email,
      role: data.user.user_metadata?.role
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function removeAdminRole(email) {
  try {
    console.log(`🔍 Looking up user: ${email}`);
    
    // Get user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }
    
    const user = users.find(u => u.email === email);
    
    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }
    
    console.log(`✅ Found user: ${user.email} (${user.id})`);
    
    // Update user metadata to remove admin role
    const updatedMetadata = { ...user.user_metadata };
    delete updatedMetadata.role;
    
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: updatedMetadata
    });
    
    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
    
    console.log(`🎉 Successfully removed admin role from ${email}`);
    console.log(`📋 User details:`, {
      id: data.user.id,
      email: data.user.email,
      role: data.user.user_metadata?.role || 'user'
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function listUsers() {
  try {
    console.log('📋 Listing all users...\n');
    
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      throw new Error(`Failed to list users: ${error.message}`);
    }
    
    if (users.length === 0) {
      console.log('No users found.');
      return;
    }
    
    users.forEach(user => {
      const role = user.user_metadata?.role || 'user';
      const isAdmin = role === 'admin' ? '👑' : '👤';
      console.log(`${isAdmin} ${user.email} (${role})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleDateString()}`);
      console.log(`   Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Main script execution
const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0];
  const email = args[1];
  
  if (command === 'list') {
    await listUsers();
    return;
  }
  
  if (!email) {
    console.log('🔧 Admin Role Management Script');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/grant-admin.js grant <user-email>   # Grant admin role');
    console.log('  node scripts/grant-admin.js remove <user-email>  # Remove admin role');
    console.log('  node scripts/grant-admin.js list                 # List all users');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/grant-admin.js grant admin@example.com');
    console.log('  node scripts/grant-admin.js remove user@example.com');
    console.log('  node scripts/grant-admin.js list');
    process.exit(1);
  }
  
  if (command === 'grant') {
    await grantAdminRole(email);
  } else if (command === 'remove') {
    await removeAdminRole(email);
  } else {
    console.error('❌ Invalid command. Use "grant", "remove", or "list"');
    process.exit(1);
  }
};

main(); 