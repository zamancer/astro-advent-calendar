#!/usr/bin/env node

/**
 * Generate Invite Link Script
 * Generate a magic link for a friend to directly access the advent calendar
 *
 * Usage:
 *   pnpm invite <email>
 *   pnpm invite --help
 *
 * Environment Variables:
 *   PUBLIC_SUPABASE_URL         Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY   Supabase service role key (secret)
 */

import { createClient } from "@supabase/supabase-js";

// ============================================
// CONFIGURATION
// ============================================

const REDIRECT_URL =
  process.env.INVITE_REDIRECT_URL ||
  "https://astro-advent-calendar.vercel.app/auth/callback";

// ============================================
// HELPERS
// ============================================

/**
 * Show help message
 */
function showHelp() {
  console.log(`
Generate Invite Link Script

Generate a magic link for a friend to directly access the advent calendar.
The link can be included in your invitation email for one-click access.

Usage:
  pnpm invite <email>
  pnpm invite --help

Options:
  --help, -h    Show this help message

Examples:
  # Generate invite link for a friend
  pnpm invite sarah@example.com

Environment Variables:
  PUBLIC_SUPABASE_URL         Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY   Supabase service role key (from Dashboard > Settings > API)
  INVITE_REDIRECT_URL         (Optional) Custom redirect URL after login

Notes:
  - The friend must already exist in the 'friends' table
  - Links expire in 24 hours (Supabase default)
  - Once clicked, the link is consumed
  - If the friend loses their session later, they can use the normal login flow
  `);
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================
// MAIN
// ============================================

async function main() {
  const args = process.argv.slice(2);

  // Show help
  if (args.includes("--help") || args.includes("-h") || args.length === 0) {
    showHelp();
    process.exit(0);
  }

  const email = args[0];

  // Validate email format
  if (!isValidEmail(email)) {
    console.error(`Error: Invalid email format: ${email}`);
    process.exit(1);
  }

  // Check environment variables
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error("Error: Missing PUBLIC_SUPABASE_URL environment variable");
    console.error("Please set it in your .env file\n");
    process.exit(1);
  }

  if (!serviceRoleKey) {
    console.error(
      "Error: Missing SUPABASE_SERVICE_ROLE_KEY environment variable"
    );
    console.error(
      "Get it from: Supabase Dashboard > Project Settings > API > service_role (secret)"
    );
    console.error("Add it to your .env file (never commit this key!)\n");
    process.exit(1);
  }

  // Create Supabase admin client with service role key
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log(`\nGenerating invite link for: ${email}\n`);

  // Verify friend exists in database
  const { data: friend, error: friendError } = await supabase
    .from("friends")
    .select("id, name, email")
    .eq("email", email)
    .single();

  if (friendError || !friend) {
    console.error(`Error: No friend found with email: ${email}`);
    console.error(
      "The friend must be added to the database before generating an invite link."
    );
    console.error("Use the admin tools to create the friend first.\n");
    process.exit(1);
  }

  // Generate magic link
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: email,
    options: {
      redirectTo: REDIRECT_URL,
    },
  });

  if (error) {
    console.error(`Error generating magic link: ${error.message}`);
    process.exit(1);
  }

  // Output the link
  console.log("=".repeat(60));
  console.log(`Magic link for ${friend.name} (${friend.email}):`);
  console.log("=".repeat(60));
  console.log("");
  console.log(data.properties.action_link);
  console.log("");
  console.log("=".repeat(60));
  console.log(
    "Link expires in 24 hours. Copy and paste into your invitation email."
  );
  console.log("=".repeat(60) + "\n");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
