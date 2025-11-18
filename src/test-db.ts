/**
 * Test file to verify database types and functions
 * Run: npx tsx src/test-db.ts
 */

import {
  getAllFriends,
  getFriendByCode,
  recordWindowOpen,
  getFriendWithProgress,
  generateUniqueCode,
  isValidEmail,
  isValidWindowNumber,
} from './lib/database';

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
  const { data: friends, error: friendsError } = await getAllFriends();
  if (friendsError) {
    console.error('  ❌ Error:', friendsError.message);
  } else if (friends) {
    console.log(`  ✅ Found ${friends.length} friends`);
    friends.forEach((f) => console.log(`     - ${f.name} (${f.unique_code})`));
  }
  console.log();

  // Test 3: Get Friend by Code
  console.log('✅ Test 3: Get Friend by Code');
  const { data: alice, error: aliceError } = await getFriendByCode('ALICE123');
  if (aliceError) {
    console.error('  ❌ Error:', aliceError.message);
  } else if (alice) {
    console.log(`  ✅ Found friend: ${alice.name} (${alice.email})`);
  } else {
    console.log('  ℹ️  No friend found with code ALICE123 (seed data may not be loaded)');
  }
  console.log();

  // Test 4: Get Friend Progress (if Alice exists)
  if (alice) {
    console.log('✅ Test 4: Get Friend Progress');
    const { data: progress, error: progressError } = await getFriendWithProgress(alice.id);
    if (progressError) {
      console.error('  ❌ Error:', progressError.message);
    } else if (progress) {
      console.log(`  ✅ ${progress.name}'s progress:`);
      console.log(`     - Windows opened: ${progress.total_windows_opened}`);
      console.log(`     - Window numbers: [${progress.windows_opened.join(', ')}]`);
    }
    console.log();

    // Test 5: Record Window Open
    console.log('✅ Test 5: Record Window Open (Window 12)');
    const { data: windowOpen, error: openError } = await recordWindowOpen({
      friend_id: alice.id,
      window_number: 12,
    });
    if (openError) {
      if (openError.message.includes('duplicate')) {
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
