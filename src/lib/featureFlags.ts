/**
 * Feature flag system for controlling application features
 */

/**
 * Check if demo mode is enabled
 * Demo mode is ON by default (true) to allow development without Supabase
 * Set PUBLIC_DEMO_MODE=false in .env to disable demo mode
 *
 * @returns {boolean} true if demo mode is enabled
 */
export const isDemoMode = (): boolean => {
  const demoMode = import.meta.env.PUBLIC_DEMO_MODE;

  // Default to true if not set or if explicitly set to 'true'
  if (!demoMode || demoMode === 'true' || demoMode === '1') {
    return true;
  }

  // Only disable if explicitly set to 'false' or '0'
  if (demoMode === 'false' || demoMode === '0') {
    return false;
  }

  // Default to true for any other value
  return true;
};

/**
 * Check if authentication is required
 * Returns true when NOT in demo mode
 *
 * @returns {boolean} true if authentication is required
 */
export const isAuthRequired = (): boolean => {
  return !isDemoMode();
};

/**
 * Check if Supabase features should be enabled
 * Returns true when NOT in demo mode
 *
 * @returns {boolean} true if Supabase features are enabled
 */
export const isSupabaseEnabled = (): boolean => {
  return !isDemoMode();
};
