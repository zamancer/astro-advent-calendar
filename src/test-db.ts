/**
 * Test file to verify database types and functions
 * Run: npx tsx src/test-db.ts
 *
 * Note: Make sure your .env file is configured with Supabase credentials
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import {
  generateUniqueCode,
  isValidEmail,
  isValidWindowNumber,
} from './lib/database.js';

// Load environment variables from .env file
config();

// Check required environment variables
if (!process.env.PUBLIC_SUPABASE_URL || !process.env.PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Error: Missing Supabase credentials in .env file');
  console.error('   Please ensure PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

// Create Supabase client for Node.js
const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

async function testDatabase() {
  console.log('🧪 Testing Database Functions...\n');

  // Test 1: Utility Functions
  console.log('✅ Test 1: Utility Functions');
  console.log('  - Generate unique code:', generateUniqueCode());
  console.log('  - Valid email:', isValidEmail('test@example.com'));
  console.log('  - Invalid email:', isValidEmail('not-an-email'));
  console.log('  - Valid window number (5):', isValidWindowNumber(5));
  console.log('  - Invalid window number (25):', isValidWindowNumber(25));
  console.log();

  // Test 2: Get All Friends
  console.log('✅ Test 2: Get All Friends');
  const { data: friends, error: friendsError } = await supabase
    .from('friends')
    .select('*')
    .order('created_at', { ascending: true });

  if (friendsError) {
    console.error('  ❌ Error:', friendsError.message);
  } else if (friends) {
    console.log(`  ✅ Found ${friends.length} friends`);
    friends.forEach((f) => console.log(`     - ${f.name} (${f.unique_code})`));
  }
  console.log();

  // Test 3: Get Friend by Code
  console.log('✅ Test 3: Get Friend by Code');
  const { data: alice, error: aliceError } = await supabase
    .from('friends')
    .select('*')
    .eq('unique_code', 'ALICE123')
    .single();

  if (aliceError) {
    if (aliceError.code === 'PGRST116') {
      console.log('  ℹ️  No friend found with code ALICE123 (seed data may not be loaded)');
    } else {
      console.error('  ❌ Error:', aliceError.message);
    }
  } else if (alice) {
    console.log(`  ✅ Found friend: ${alice.name} (${alice.email})`);
  }
  console.log();

  // Test 4: Get Friend Progress (if Alice exists)
  if (alice) {
    console.log('✅ Test 4: Get Friend Progress');

    // Get friend's window opens
    const { data: windowOpens, error: opensError } = await supabase
      .from('friend_window_opens')
      .select('*')
      .eq('friend_id', alice.id)
      .order('window_number', { ascending: true });

    if (opensError) {
      console.error('  ❌ Error:', opensError.message);
    } else if (windowOpens) {
      const windows_opened = windowOpens.map((wo) => wo.window_number).sort((a, b) => a - b);
      console.log(`  ✅ ${alice.name}'s progress:`);
      console.log(`     - Windows opened: ${windows_opened.length}`);
      console.log(`     - Window numbers: [${windows_opened.join(', ')}]`);
    }
    console.log();

    // Test 5: Record Window Open
    console.log('✅ Test 5: Record Window Open (Window 12)');
    const { data: windowOpen, error: openError } = await supabase
      .from('friend_window_opens')
      .insert({
        friend_id: alice.id,
        window_number: 12,
      })
      .select()
      .single();

    if (openError) {
      if (openError.code === '23505') {
        console.log('  ℹ️  Window 12 already opened (duplicate prevented) ✅');
      } else {
        console.error('  ❌ Error:', openError.message);
      }
    } else if (windowOpen) {
      console.log(`  ✅ Window 12 opened successfully at ${windowOpen.opened_at}`);
    }
    console.log();
  }

  console.log('🎉 All tests completed!\n');
}

// Run tests
testDatabase().catch(console.error);
