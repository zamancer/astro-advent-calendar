import { useState, useEffect, useRef } from "react";
import { isDemoMode } from "../lib/featureFlags";
import { getCurrentUser, getCurrentFriend, signOut } from "../lib/auth";
import type { Friend } from "../types/database";

export default function UserMenu() {
  const [friend, setFriend] = useState<Friend | null>(null);
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    async function checkAuth() {
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  }

  function handleButtonKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsOpen(!isOpen);
    }
  }

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
  const menuId = "user-menu-dropdown";

  return (
    <div className="relative" ref={menuRef} onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleButtonKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={menuId}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
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
      {isOpen && (
        <div
          id={menuId}
          role="menu"
          aria-label="User menu"
          className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-xl z-50"
        >
          <button
            role="menuitem"
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
