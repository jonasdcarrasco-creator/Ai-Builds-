import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Shadow } from '../../constants';
import { useAppStore } from '../../store';
import { DatePlan, DatePlanItem } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanDetailScreenProps {
  navigation: any;
  route: { params: { plan: DatePlan } };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  upcoming: Colors.info,
  completed: Colors.success,
  cancelled: Colors.error,
};

const STATUS_LABELS: Record<string, string> = {
  upcoming: 'Upcoming',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const ITEM_TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  restaurant: 'restaurant',
  activity: 'compass',
  idea: 'heart',
  custom: 'star',
};

const ITEM_TYPE_COLORS: Record<string, string> = {
  restaurant: '#E74C3C',
  activity: '#E67E22',
  idea: '#FF6B9D',
  custom: '#9B59B6',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function getDaysAway(dateStr: string): number | null {
  try {
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / 86_400_000);
  } catch {
    return null;
  }
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function getCountdownLabel(daysAway: number): string {
  if (daysAway === 0) return 'Today!';
  if (daysAway === 1) return '1 day away';
  if (daysAway > 1) return `${daysAway} days away`;
  return `${Math.abs(daysAway)} days ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const color = STATUS_COLORS[status] ?? Colors.gray400;
  return (
    <View style={[badgeStyles.wrap, { backgroundColor: color + '22' }]}>
      <View style={[badgeStyles.dot, { backgroundColor: color }]} />
      <Text style={[badgeStyles.label, { color }]}>
        {STATUS_LABELS[status] ?? status}
      </Text>
    </View>
  );
};

const badgeStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});

// ── Budget Card ───────────────────────────────────────────────────────────────

const BudgetCard: React.FC<{
  items: DatePlanItem[];
  totalBudget?: number;
}> = ({ items, totalBudget }) => {
  const estimated = items.reduce((sum, i) => sum + (i.cost ?? 0), 0);
  const budget = totalBudget ?? 0;
  const ratio = budget > 0 ? Math.min(estimated / budget, 1) : 0;
  const overBudget = budget > 0 && estimated > budget;

  return (
    <View style={[styles.budgetCard, Shadow.sm]}>
      <View style={styles.budgetHeader}>
        <View style={styles.budgetIconWrap}>
          <Ionicons name="wallet-outline" size={18} color={Colors.primary} />
        </View>
        <Text style={styles.budgetTitle}>Budget Summary</Text>
      </View>

      <View style={styles.budgetRow}>
        <View style={styles.budgetStat}>
          <Text style={styles.budgetStatLabel}>Estimated</Text>
          <Text style={[styles.budgetStatValue, { color: Colors.textPrimary }]}>
            {formatCurrency(estimated)}
          </Text>
        </View>
        {budget > 0 && (
          <>
            <View style={styles.budgetDivider} />
            <View style={styles.budgetStat}>
              <Text style={styles.budgetStatLabel}>Budget</Text>
              <Text style={[styles.budgetStatValue, { color: Colors.textPrimary }]}>
                {formatCurrency(budget)}
              </Text>
            </View>
            <View style={styles.budgetDivider} />
            <View style={styles.budgetStat}>
              <Text style={styles.budgetStatLabel}>Remaining</Text>
              <Text
                style={[
                  styles.budgetStatValue,
                  { color: overBudget ? Colors.error : Colors.success },
                ]}
              >
                {overBudget ? '-' : ''}
                {formatCurrency(Math.abs(budget - estimated))}
              </Text>
            </View>
          </>
        )}
      </View>

      {budget > 0 && (
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${ratio * 100}%` as any,
                backgroundColor: overBudget ? Colors.error : Colors.primary,
              },
            ]}
          />
        </View>
      )}

      {budget === 0 && estimated > 0 && (
        <Text style={styles.budgetNote}>
          No budget set — activities total {formatCurrency(estimated)}
        </Text>
      )}

      {estimated === 0 && (
        <Text style={styles.budgetNote}>No costs added to activities yet</Text>
      )}
    </View>
  );
};

// ── Timeline Item ─────────────────────────────────────────────────────────────

const TimelineItem: React.FC<{
  item: DatePlanItem;
  isLast: boolean;
  onToggle: (id: string) => void;
}> = ({ item, isLast, onToggle }) => {
  const typeColor = ITEM_TYPE_COLORS[item.type] ?? Colors.primary;
  const iconName = ITEM_TYPE_ICONS[item.type] ?? 'ellipse';

  return (
    <View style={styles.timelineRow}>
      {/* Left rail: dot + connector line */}
      <View style={styles.timelineRail}>
        <View style={[styles.timelineDot, { backgroundColor: typeColor }]}>
          <Ionicons name={iconName} size={10} color={Colors.white} />
        </View>
        {!isLast && (
          <View style={[styles.timelineLine, { backgroundColor: typeColor + '40' }]} />
        )}
      </View>

      {/* Content card */}
      <View style={[styles.timelineCard, Shadow.sm, item.isCompleted && styles.timelineCardDone]}>
        {/* Type tag + checkbox */}
        <View style={styles.timelineCardHeader}>
          <View style={styles.timelineTypeTag}>
            <Ionicons name={iconName} size={12} color={typeColor} />
            <Text style={[styles.timelineTypeText, { color: typeColor }]}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.checkbox, item.isCompleted && styles.checkboxChecked]}
            onPress={() => onToggle(item.id)}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {item.isCompleted && (
              <Ionicons name="checkmark" size={12} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text
          style={[styles.timelineTitle, item.isCompleted && styles.timelineTitleDone]}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        {/* Description */}
        {!!item.description && (
          <Text style={styles.timelineDesc} numberOfLines={3}>
            {item.description}
          </Text>
        )}

        {/* Meta chips: time, duration, cost, location */}
        <View style={styles.timelineMeta}>
          {!!item.time && (
            <View style={styles.metaChip}>
              <Ionicons name="time-outline" size={11} color={Colors.textMuted} />
              <Text style={styles.metaChipText}>{item.time}</Text>
            </View>
          )}
          {!!item.duration && (
            <View style={styles.metaChip}>
              <Ionicons name="hourglass-outline" size={11} color={Colors.textMuted} />
              <Text style={styles.metaChipText}>{item.duration}</Text>
            </View>
          )}
          {item.cost != null && item.cost > 0 && (
            <View style={styles.metaChip}>
              <Ionicons name="cash-outline" size={11} color={Colors.textMuted} />
              <Text style={styles.metaChipText}>{formatCurrency(item.cost)}</Text>
            </View>
          )}
          {!!item.location && (
            <View style={styles.metaChip}>
              <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
              <Text style={styles.metaChipText} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const PlanDetailScreen: React.FC<PlanDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const { updatePlan } = useAppStore();

  // Local copy so UI is immediately reactive
  const [plan, setPlan] = useState<DatePlan>(route.params.plan);

  const statusColor = STATUS_COLORS[plan.status] ?? Colors.gray400;
  const daysAway = plan.status === 'upcoming' ? getDaysAway(plan.date) : null;
  const completedCount = plan.items.filter((i) => i.isCompleted).length;

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleToggleItem = useCallback(
    (itemId: string) => {
      const updatedItems = plan.items.map((item) =>
        item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
      );
      const updatedPlan = { ...plan, items: updatedItems };
      setPlan(updatedPlan);
      updatePlan(plan.id, { items: updatedItems });
    },
    [plan, updatePlan]
  );

  const handleMarkComplete = useCallback(() => {
    Alert.alert(
      'Mark as Complete',
      'Are you sure you want to mark this date as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          style: 'default',
          onPress: () => {
            const updatedPlan = { ...plan, status: 'completed' as const };
            setPlan(updatedPlan);
            updatePlan(plan.id, { status: 'completed' });
          },
        },
      ]
    );
  }, [plan, updatePlan]);

  const handleShare = useCallback(async () => {
    try {
      const itemList = plan.items
        .map((i) => `• ${i.title}${i.time ? ` at ${i.time}` : ''}`)
        .join('\n');
      await Share.share({
        title: plan.title,
        message: `Check out our date plan: "${plan.title}" on ${formatDate(plan.date)}${
          itemList ? `\n\n${itemList}` : ''
        }`,
      });
    } catch {
      // User dismissed — no action needed
    }
  }, [plan]);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {plan.title}
          </Text>
          <StatusBadge status={plan.status} />
        </View>

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={handleShare}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="share-outline" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
      >

        {/* ── Hero Gradient Card ──────────────────────────────────────────── */}
        <LinearGradient
          colors={['#FF6B9D', '#FF8FB3']}
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Decorative background icon */}
          <View style={styles.heroDecoIcon} pointerEvents="none">
            <Ionicons name="heart" size={120} color="rgba(255,255,255,0.10)" />
          </View>

          <View style={styles.heroContent}>
            <View style={styles.heroDateRow}>
              <Ionicons name="calendar" size={16} color="rgba(255,255,255,0.85)" />
              <Text style={styles.heroDateText}>{formatDate(plan.date)}</Text>
            </View>

            {!!plan.time && (
              <View style={styles.heroDateRow}>
                <Ionicons name="time" size={16} color="rgba(255,255,255,0.85)" />
                <Text style={styles.heroDateText}>{plan.time}</Text>
              </View>
            )}

            {plan.status === 'upcoming' && daysAway != null && (
              <View style={styles.countdownBadge}>
                <Ionicons name="rocket-outline" size={13} color={Colors.white} />
                <Text style={styles.countdownText}>
                  {getCountdownLabel(daysAway)}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* ── Budget Summary Card ─────────────────────────────────────────── */}
        <BudgetCard items={plan.items} totalBudget={plan.totalBudget} />

        {/* ── Timeline Section ────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Activities</Text>
          {plan.items.length > 0 && (
            <Text style={styles.sectionCount}>
              {completedCount}/{plan.items.length} done
            </Text>
          )}
        </View>

        {plan.items.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="sparkles-outline" size={40} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No activities yet</Text>
            <Text style={styles.emptySubtitle}>
              Add some magic to this date!
            </Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {plan.items.map((item, index) => (
              <TimelineItem
                key={item.id}
                item={item}
                isLast={index === plan.items.length - 1}
                onToggle={handleToggleItem}
              />
            ))}
          </View>
        )}

        {/* ── Notes Section ───────────────────────────────────────────────── */}
        {!!plan.notes && (
          <View style={[styles.notesCard, Shadow.sm]}>
            <View style={styles.notesHeader}>
              <View style={styles.notesIconWrap}>
                <Ionicons name="document-text-outline" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.notesTitle}>Notes</Text>
            </View>
            <Text style={styles.notesBody}>{plan.notes}</Text>
          </View>
        )}

      </ScrollView>

      {/* ── Bottom Action Bar ────────────────────────────────────────────── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <TouchableOpacity
          style={styles.addActivityBtn}
          activeOpacity={0.8}
          onPress={() => {
            // Navigate to add-activity screen when wired up
          }}
        >
          <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
          <Text style={styles.addActivityText}>Add Activity</Text>
        </TouchableOpacity>

        {plan.status === 'upcoming' && (
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={handleMarkComplete}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#FF6B9D', '#FF8FB3']}
              style={styles.completeBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color={Colors.white} />
              <Text style={styles.completeBtnText}>Mark Complete</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    gap: Spacing.sm,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    gap: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },

  // ── Scroll
  scrollContent: {
    gap: Spacing.base,
    paddingTop: Spacing.base,
  },

  // ── Hero
  heroCard: {
    marginHorizontal: Spacing.base,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    minHeight: 150,
    overflow: 'hidden',
  },
  heroDecoIcon: {
    position: 'absolute',
    right: -10,
    bottom: -20,
  },
  heroContent: {
    gap: Spacing.sm,
    zIndex: 1,
  },
  heroDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  countdownText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.3,
  },

  // ── Budget
  budgetCard: {
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  budgetIconWrap: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetStat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  budgetStatLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  budgetStatValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  budgetDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.gray200,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  budgetNote: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // ── Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionCount: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },

  // ── Timeline container
  timeline: {
    paddingHorizontal: Spacing.base,
  },

  // ── Timeline row
  timelineRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    minHeight: 80,
  },
  timelineRail: {
    width: 28,
    alignItems: 'center',
    paddingTop: Spacing.base,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    marginTop: 4,
    marginBottom: -4,
  },

  // ── Timeline card
  timelineCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  timelineCardDone: {
    opacity: 0.6,
  },
  timelineCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timelineTypeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: Colors.success,
    backgroundColor: Colors.success,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 21,
  },
  timelineTitleDone: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  timelineDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  timelineMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: Spacing.xs,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.gray50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  metaChipText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },

  // ── Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    gap: Spacing.md,
    marginHorizontal: Spacing.base,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Notes
  notesCard: {
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  notesIconWrap: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  notesBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  // ── Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    ...Shadow.sm,
  },
  addActivityBtn: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceAlt,
  },
  addActivityText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  completeBtn: {
    flex: 1.4,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  completeBtnGradient: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
});
