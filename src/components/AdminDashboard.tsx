import { useState, useEffect, useCallback } from 'react';
import { getAdminFriendProgress, getAdminStatistics, getAdminWindowPopularity } from '../lib/database';
import type { AdminFriendProgress, AdminStatistics, AdminWindowPopularity } from '../types/database';
import { supabase } from '../lib/supabase';
import { Users, TrendingUp, Calendar, Clock, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';

type SortField = 'name' | 'progress' | 'lastActivity';
type SortDirection = 'asc' | 'desc';

interface AdminDashboardProps {
  isDemo?: boolean;
}

export function AdminDashboard({ isDemo = false }: AdminDashboardProps) {
  const [friendProgress, setFriendProgress] = useState<AdminFriendProgress[]>([]);
  const [statistics, setStatistics] = useState<AdminStatistics | null>(null);
  const [windowPopularity, setWindowPopularity] = useState<AdminWindowPopularity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('progress');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedFriend, setSelectedFriend] = useState<AdminFriendProgress | null>(null);

  // Load data function wrapped in useCallback to fix React hooks warning
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isDemo) {
        // Load demo data
        setFriendProgress(generateDemoFriendProgress());
        setStatistics(generateDemoStatistics());
        setWindowPopularity(generateDemoWindowPopularity());
      } else {
        // Load real data from database
        const [progressResult, statsResult, popularityResult] = await Promise.all([
          getAdminFriendProgress(),
          getAdminStatistics(),
          getAdminWindowPopularity(),
        ]);

        if (progressResult.error) throw new Error(progressResult.error.message);
        if (statsResult.error) throw new Error(statsResult.error.message);
        if (popularityResult.error) throw new Error(popularityResult.error.message);

        setFriendProgress(progressResult.data || []);
        setStatistics(statsResult.data);
        setWindowPopularity(popularityResult.data || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [isDemo]);

  // Load data on mount and when isDemo changes
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Real-time updates
  useEffect(() => {
    if (isDemo || !supabase) return;

    const channel = supabase
      .channel('admin-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_window_opens',
        },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [isDemo, loadDashboardData]);

  // Sort friends
  const sortedFriends = [...friendProgress].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'name':
        comparison = a.friend_name.localeCompare(b.friend_name);
        break;
      case 'progress':
        comparison = a.total_windows_opened - b.total_windows_opened;
        break;
      case 'lastActivity':
        const aTime = a.last_opened_at ? new Date(a.last_opened_at).getTime() : 0;
        const bTime = b.last_opened_at ? new Date(b.last_opened_at).getTime() : 0;
        comparison = aTime - bTime;
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <p className="font-semibold text-destructive">Error loading dashboard</p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Track all friends&apos; calendar progress</p>
        </div>
        {isDemo && (
          <div className="rounded-md border border-amber-500 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            Demo Mode
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Friends"
            value={statistics.total_friends}
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            title="Total Opens"
            value={statistics.total_window_opens}
            icon={<Calendar className="h-4 w-4" />}
          />
          <StatCard
            title="Avg Progress"
            value={`${statistics.avg_windows_per_friend.toFixed(1)}/12`}
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <StatCard
            title="Most Popular"
            value={statistics.most_popular_window ? `Window ${statistics.most_popular_window}` : 'N/A'}
            subtitle={
              statistics.most_popular_window_count
                ? `${statistics.most_popular_window_count} opens`
                : undefined
            }
            icon={<Clock className="h-4 w-4" />}
          />
        </div>
      )}

      {/* Friends List */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold">Friends Progress</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {friendProgress.length} {friendProgress.length === 1 ? 'friend' : 'friends'} registered
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2 border-b bg-muted/50 px-6 py-3">
          <SortButton
            label="Name"
            active={sortField === 'name'}
            direction={sortDirection}
            onClick={() => toggleSort('name')}
          />
          <SortButton
            label="Progress"
            active={sortField === 'progress'}
            direction={sortDirection}
            onClick={() => toggleSort('progress')}
          />
          <SortButton
            label="Last Activity"
            active={sortField === 'lastActivity'}
            direction={sortDirection}
            onClick={() => toggleSort('lastActivity')}
          />
        </div>

        {/* Friends Table */}
        <div className="divide-y">
          {sortedFriends.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">No friends registered yet</div>
          ) : (
            sortedFriends.map((friend) => (
              <FriendRow
                key={friend.friend_id}
                friend={friend}
                isExpanded={selectedFriend?.friend_id === friend.friend_id}
                onToggle={() =>
                  setSelectedFriend(
                    selectedFriend?.friend_id === friend.friend_id ? null : friend
                  )
                }
                formatDate={formatDate}
              />
            ))
          )}
        </div>
      </div>

      {/* Window Popularity */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold">Window Popularity</h2>
          <p className="mt-1 text-sm text-muted-foreground">How many friends opened each window</p>
        </div>
        <div className="grid gap-2 p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((windowNum) => {
            const popularity = windowPopularity.find((w) => w.window_number === windowNum);
            const count = popularity?.friends_count || 0;
            const total = friendProgress.length;
            const percentage = total > 0 ? (count / total) * 100 : 0;

            return (
              <div
                key={windowNum}
                className="rounded-md border p-3 transition-colors hover:bg-accent"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Window {windowNum}</span>
                  <span className="text-xs text-muted-foreground">
                    {count}/{total}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {percentage.toFixed(0)}% opened
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="rounded-md bg-primary/10 p-2 text-primary">{icon}</div>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

// Sort Button Component
function SortButton({
  label,
  active,
  direction,
  onClick,
}: {
  label: string;
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      }`}
    >
      {label}
      {active ? (
        direction === 'asc' ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3" />
      )}
    </button>
  );
}

// Friend Row Component
function FriendRow({
  friend,
  isExpanded,
  onToggle,
  formatDate,
}: {
  friend: AdminFriendProgress;
  isExpanded: boolean;
  onToggle: () => void;
  formatDate: (date: string | null) => string;
}) {
  const progressPercent = (friend.total_windows_opened / 12) * 100;

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full p-6 text-left transition-colors hover:bg-accent"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {friend.friend_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold">{friend.friend_name}</h3>
                <p className="text-sm text-muted-foreground">{friend.friend_email}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Progress</p>
              <p className="mt-1 text-lg font-bold">
                {friend.total_windows_opened}/12
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Last Active</p>
              <p className="mt-1 text-sm">{formatDate(friend.last_opened_at)}</p>
            </div>
            <div className="text-muted-foreground">
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t bg-muted/50 px-6 py-4">
          <h4 className="mb-3 text-sm font-semibold">Opened Windows</h4>
          <div className="grid grid-cols-12 gap-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((day) => {
              const isOpened = friend.windows_opened.includes(day);
              return (
                <div
                  key={day}
                  className={`flex h-10 items-center justify-center rounded-md border text-sm font-medium ${
                    isOpened
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/20 bg-background text-muted-foreground'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Joined:</span>{' '}
              <span className="text-muted-foreground">{formatDate(friend.joined_at)}</span>
            </div>
            <div>
              <span className="font-medium">First Open:</span>{' '}
              <span className="text-muted-foreground">{formatDate(friend.first_opened_at)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Demo Data Generators
function generateDemoFriendProgress(): AdminFriendProgress[] {
  const names = [
    'Alice Johnson',
    'Bob Smith',
    'Charlie Davis',
    'Diana Martinez',
    'Eve Wilson',
    'Frank Brown',
  ];

  return names.map((name, i) => {
    const totalWindows = Math.floor(Math.random() * 13);
    const windows = Array.from({ length: totalWindows }, (_, j) => j + 1);
    const hoursAgo = Math.floor(Math.random() * 72);
    const lastOpened = new Date(Date.now() - hoursAgo * 3600000).toISOString();

    return {
      friend_id: `demo-${i}`,
      friend_name: name,
      friend_email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
      joined_at: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
      windows_opened: windows,
      total_windows_opened: totalWindows,
      last_opened_at: totalWindows > 0 ? lastOpened : null,
      first_opened_at: totalWindows > 0 ? new Date(Date.now() - 14 * 86400000).toISOString() : null,
    };
  });
}

function generateDemoStatistics(): AdminStatistics {
  return {
    total_friends: 6,
    total_window_opens: 42,
    avg_windows_per_friend: 7.0,
    max_windows_opened: 12,
    most_popular_window: 1,
    most_popular_window_count: 5,
  };
}

function generateDemoWindowPopularity(): AdminWindowPopularity[] {
  return Array.from({ length: 12 }, (_, i) => ({
    window_number: i + 1,
    friends_count: Math.floor(Math.random() * 6),
    friend_ids: [],
    last_opened_at: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
    first_opened_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  }));
}
