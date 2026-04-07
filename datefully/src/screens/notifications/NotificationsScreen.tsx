import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Animated,
  ListRenderItemInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, BorderRadius, Shadow } from '../../constants';
import { useAppStore } from '../../store';
import { Notification } from '../../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = 'all' | 'unread';

type NotificationIconConfig = {
  name: React.ComponentProps<typeof Ionicons>['name'];
  bg: string;
  fg: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
  if (diffHr < 24) return diffHr === 1 ? '1 hour ago' : `${diffHr} hours ago`;
  if (diffDay === 1) return 'Yesterday';
  return `${diffDay} days ago`;
}

function getIconConfig(type: Notification['type']): NotificationIconConfig {
  switch (type) {
    case 'reminder':
      return { name: 'time', bg: '#FFF3E0', fg: '#F57C00' };
    case 'reservation':
      return { name: 'restaurant', bg: '#FCE4EC', fg: '#E91E63' };
    case 'suggestion':
      return { name: 'sparkles', bg: '#F3E5F5', fg: '#8E24AA' };
    case 'achievement':
      return { name: 'trophy', bg: '#FFFDE7', fg: '#F9A825' };
  }
}

// ---------------------------------------------------------------------------
// Mock data (shown when store.notifications is empty)
// ---------------------------------------------------------------------------

const now = new Date();

function daysAgo(d: number): string {
  const t = new Date(now);
  t.setDate(t.getDate() - d);
  return t.toISOString();
}

function hoursAgo(h: number): string {
  const t = new Date(now);
  t.setHours(t.getHours() - h);
  return t.toISOString();
}

function minutesAgo(m: number): string {
  const t = new Date(now);
  t.setMinutes(t.getMinutes() - m);
  return t.toISOString();
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'mock-1',
    type: 'reminder',
    title: 'Date night coming up!',
    body: "You have a romantic dinner planned for tonight at 7 PM. Don't forget to make it special.",
    isRead: false,
    createdAt: minutesAgo(18),
  },
  {
    id: 'mock-2',
    type: 'reservation',
    title: 'Reservation confirmed',
    body: 'Your table at Bella Roma for 2 has been confirmed for Friday at 8:00 PM. Confirmation: #DR4921.',
    isRead: false,
    createdAt: hoursAgo(3),
  },
  {
    id: 'mock-3',
    type: 'suggestion',
    title: 'New idea just for you',
    body: 'Based on your love of outdoor adventures, we found the perfect sunset picnic spot 5 miles away.',
    isRead: true,
    createdAt: hoursAgo(11),
  },
  {
    id: 'mock-4',
    type: 'achievement',
    title: 'You earned a badge!',
    body: "You've completed 5 date nights this month. You're on fire — keep the spark alive!",
    isRead: false,
    createdAt: daysAgo(1),
  },
  {
    id: 'mock-5',
    type: 'suggestion',
    title: 'Weekend deal nearby',
    body: 'The Grand Spa & Wellness is offering 30% off couples packages this weekend only.',
    isRead: true,
    createdAt: daysAgo(3),
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface NotificationItemProps {
  item: Notification;
  onPress: (id: string) => void;
  isLast: boolean;
}

const NotificationItem = React.memo(({ item, onPress, isLast }: NotificationItemProps) => {
  const config = getIconConfig(item.type);
  const relativeTime = useMemo(() => getRelativeTime(item.createdAt), [item.createdAt]);

  const handlePress = useCallback(() => {
    if (!item.isRead) onPress(item.id);
  }, [item.id, item.isRead, onPress]);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={handlePress}
      style={[
        styles.itemContainer,
        item.isRead ? styles.itemRead : styles.itemUnread,
        isLast && styles.itemLast,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}. ${item.body}. ${relativeTime}. ${item.isRead ? 'Read' : 'Unread'}`}
      accessibilityState={{ selected: !item.isRead }}
    >
      {/* Unread indicator dot */}
      {!item.isRead && <View style={styles.unreadDot} />}

      {/* Icon */}
      <View style={[styles.iconWrapper, { backgroundColor: config.bg }]}>
        <Ionicons name={config.name} size={22} color={config.fg} />
      </View>

      {/* Content */}
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text
            style={[styles.itemTitle, !item.isRead && styles.itemTitleUnread]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={styles.itemTime}>{relativeTime}</Text>
        </View>
        <Text style={styles.itemBody} numberOfLines={2}>
          {item.body}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

interface EmptyStateProps {
  tab: Tab;
}

const EmptyState = ({ tab }: EmptyStateProps) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconWrapper}>
      <Ionicons name="notifications-off-outline" size={48} color={Colors.primary} />
    </View>
    <Text style={styles.emptyHeading}>All caught up!</Text>
    <Text style={styles.emptyBody}>
      {tab === 'unread'
        ? "You have no unread notifications. Check back later!"
        : "No notifications yet. We'll let you know about your upcoming dates and great deals."}
    </Text>
  </View>
);

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

interface NotificationsScreenProps {
  navigation?: {
    goBack: () => void;
  };
}

export const NotificationsScreen = ({ navigation }: NotificationsScreenProps) => {
  const insets = useSafeAreaInsets();
  const storeNotifications = useAppStore((s) => s.notifications);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);

  const [activeTab, setActiveTab] = useState<Tab>('all');

  // Use mock data when store is empty
  const notifications: Notification[] = storeNotifications.length > 0
    ? storeNotifications
    : MOCK_NOTIFICATIONS;

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') return notifications.filter((n) => !n.isRead);
    return notifications;
  }, [notifications, activeTab]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const handleMarkAllRead = useCallback(() => {
    notifications
      .filter((n) => !n.isRead)
      .forEach((n) => markNotificationRead(n.id));
  }, [notifications, markNotificationRead]);

  const handleItemPress = useCallback(
    (id: string) => {
      markNotificationRead(id);
    },
    [markNotificationRead]
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<Notification>) => (
      <NotificationItem
        item={item}
        onPress={handleItemPress}
        isLast={index === filteredNotifications.length - 1}
      />
    ),
    [handleItemPress, filteredNotifications.length]
  );

  const keyExtractor = useCallback((item: Notification) => item.id, []);

  const ListHeader = (
    <>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badgeWrapper}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={handleMarkAllRead}
          disabled={unreadCount === 0}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Mark all as read"
        >
          <Text style={[styles.markAllText, unreadCount === 0 && styles.markAllDisabled]}>
            Mark all read
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab row */}
      <View style={styles.tabRow}>
        {(['all', 'unread'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab }}
          >
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
              {tab === 'all' ? 'All' : 'Unread'}
            </Text>
            {tab === 'unread' && unreadCount > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Divider */}
      <View style={styles.divider} />
    </>
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <FlatList
        data={filteredNotifications}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={<EmptyState tab={activeTab} />}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={true}
        overScrollMode="always"
      />
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginHorizontal: Spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  badgeWrapper: {
    minWidth: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  markAllDisabled: {
    color: Colors.textMuted,
  },

  // ── Tab row ───────────────────────────────────────────────────────────────
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
  },
  tabActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  tabLabelActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },

  // ── Divider ───────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: Colors.gray200,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.xs,
  },

  // ── List ──────────────────────────────────────────────────────────────────
  listContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.base,
  },

  // ── Notification item ─────────────────────────────────────────────────────
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.base,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    position: 'relative',
    ...Shadow.sm,
  },
  itemRead: {
    backgroundColor: Colors.surface,
    borderColor: Colors.gray100,
  },
  itemUnread: {
    backgroundColor: Colors.surfaceAlt,
    borderColor: Colors.primaryLight + '55',
  },
  itemLast: {
    marginBottom: Spacing.sm,
  },
  unreadDot: {
    position: 'absolute',
    top: Spacing.base,
    right: Spacing.base,
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: Spacing.md,
  },
  itemContent: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.xs,
    marginBottom: 3,
  },
  itemTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 19,
  },
  itemTitleUnread: {
    fontWeight: '700',
  },
  itemTime: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '400',
    marginTop: 2,
    flexShrink: 0,
  },
  itemBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['5xl'],
    paddingBottom: Spacing['3xl'],
  },
  emptyIconWrapper: {
    width: 88,
    height: 88,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight + '44',
  },
  emptyHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
});

export default NotificationsScreen;
