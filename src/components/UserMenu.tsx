import { useState, useEffect } from "react";
import { isDemoMode } from "../lib/featureFlags";
import { getCurrentUser, getCurrentFriend, signOut } from "../lib/auth";
import type { Friend } from "../types/database";

export default function UserMenu() {
  const [friend, setFriend] = useState<Friend | null>(null);
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      // In demo mode, skip authentication
      if (isDemoMode()) {
        setLoading(false);
        return;
      }

      try {
        const user = await getCurrentUser();
        if (!user) {
          window.location.href = "/login";
          return;
        }

        const friendData = await getCurrentFriend();
        if (friendData) {
          setFriend(friendData);
          setEmail(friendData.email);
        } else {
          setEmail(user.email || "");
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        window.location.href = "/login?error=auth_failed";
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  async function handleLogout() {
    const result = await signOut();
    if (result.success) {
      window.location.href = "/login";
    } else {
      alert("Failed to sign out: " + result.error);
    }
  }

  // Don't render anything while loading or in demo mode
  if (loading || isDemoMode()) {
    return null;
  }

  const displayName = friend?.name || email || "User";
  const displayEmail = email;

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
          {displayName.charAt(0).toUpperCase()}
        </div>

        {/* User info - hidden on mobile */}
        <div className="text-left hidden md:block">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {displayName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {displayEmail}
          </div>
        </div>
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
