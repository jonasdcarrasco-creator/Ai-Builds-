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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

const ITEM_TYPE_ICONS: Record<string, string> = {
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
    const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000);
    return diff;
  } catch {
    return null;
  }
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const color = STATUS_COLORS[status] ?? Colors.gray400;
  return (
    <View style={[styles.statusBadge, { backgroundColor: color + '22' }]}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={[styles.statusText, { color }]}>
        {STATUS_LABELS[status] ?? status}
      </Text>
    </View>
  );
};

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
        <View style={styles.budgetIcon}>
          <Ionicons name="wallet-outline" size={18} color={Colors.primary} />
        </View>
        <Text style={styles.budgetTitle}>Budget Summary</Text>
      </View>

      <View style={styles.budgetRow}>
        <View style={styles.budgetStat}>
          <Text style={styles.budgetStatLabel}>Estimated Cost</Text>
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
    </View>
  );
};

const TimelineItem: React.FC<{
  item: DatePlanItem;
  index: number;
  isLast: boolean;
  onToggle: (id: string) => void;
}> = ({ item, index, isLast, onToggle }) => {
  const typeColor = ITEM_TYPE_COLORS[item.type] ?? Colors.primary;
  const iconName = (ITEM_TYPE_ICONS[item.type] ?? 'ellipse') as any;

  return (
    <View style={styles.timelineRow}>
      {/* Left rail */}
      <View style={styles.timelineRail}>
        <View style={[styles.timelineDot, { backgroundColor: typeColor }]}>
          <Ionicons name={iconName} size={10} color={Colors.white} />
        </View>
        {!isLast && <View style={[styles.timelineLine, { backgroundColor: typeColor + '40' }]} />}
      </View>

      {/* Content card */}
      <View style={[styles.timelineCard, Shadow.sm, item.isCompleted && styles.timelineCardDone]}>
        {/* Card header */}
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
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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

        {/* Meta row */}
        <View style={styles.timelineMeta}>
          {!!item.time && (
            <View style={styles.timelineMetaChip}>
              <Ionicons name="time-outline" size={11} color={Colors.textMuted} />
              <Text style={styles.timelineMetaText}>{item.time}</Text>
            </View>
          )}
          {!!item.duration && (
            <View style={styles.timelineMetaChip}>
              <Ionicons name="hourglass-outline" size={11} color={Colors.textMuted} />
              <Text style={styles.timelineMetaText}>{item.duration}</Text>
            </View>
          )}
          {item.cost != null && item.cost > 0 && (
            <View style={styles.timelineMetaChip}>
              <Ionicons name="cash-outline" size={11} color={Colors.textMuted} />
              <Text style={styles.timelineMetaText}>{formatCurrency(item.cost)}</Text>
            </View>
          )}
          {!!item.location && (
            <View style={styles.timelineMetaChip}>
              <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
              <Text style={styles.timelineMetaText} numberOfLines={1}>
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

  // Local copy of plan so UI updates immediately
  const [plan, setPlan] = useState<DatePlan>(route.params.plan);

  const statusColor = STATUS_COLORS[plan.status] ?? Colors.gray400;
  const daysAway = plan.status === 'upcoming' ? getDaysAway(plan.date) : null;

  // ── Handlers ───────────────────────────────────────────────────────────────

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
      // User dismissed share sheet — no action needed
    }
  }, [plan]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + Spacing.sm },
        ]}
      >
        <TouchableOpacity
          style={styles.headerBack}
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
          style={styles.headerAction}
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
        {/* ── Hero Card ── */}
        <LinearGradient
          colors={Colors.gradientPink as [string, string]}
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroOverlay}>
            <View style={styles.heroDateRow}>
              <Ionicons name="calendar" size={16} color="rgba(255,255,255,0.85)" />
              <Text style={styles.heroDate}>{formatDate(plan.date)}</Text>
            </View>
            {!!plan.time && (
              <View style={styles.heroDateRow}>
                <Ionicons name="time" size={16} color="rgba(255,255,255,0.85)" />
                <Text style={styles.heroDate}>{plan.time}</Text>
              </View>
            )}
            {plan.status === 'upcoming' && daysAway != null && (
              <View style={styles.countdownBadge}>
                <Text style={styles.countdownText}>
                  {daysAway === 0
                    ? 'Today!'
                    : daysAway === 1
                    ? '1 day away'
                    : daysAway > 0
                    ? `${daysAway} days away`
                    : `${Math.abs(daysAway)} days ago`}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.heroIconCluster}>
            <Ionicons name="heart" size={72} color="rgba(255,255,255,0.12)" />
          </View>
        </LinearGradient>

        {/* ── Budget ── */}
        <BudgetCard items={plan.items} totalBudget={plan.totalBudget} />

        {/* ── Timeline ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Activities</Text>
          <Text style={styles.sectionCount}>
            {plan.items.filter((i) => i.isCompleted).length}/{plan.items.length} done
          </Text>
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
                index={index}
                isLast={index === plan.items.length - 1}
                onToggle={handleToggleItem}
              />
            ))}
          </View>
        )}

        {/* ── Notes ── */}
        {!!plan.notes && (
          <View style={[styles.notesCard, Shadow.sm]}>
            <View style={styles.notesHeader}>
              <Ionicons name="document-text-outline" size={18} color={Colors.primary} />
              <Text style={styles.notesTitle}>Notes</Text>
            </View>
            <Text style={styles.notesBody}>{plan.notes}</Text>
          </View>
        )}
      </ScrollView>

      {/* ── Bottom Action Bar ── */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + Spacing.sm },
        ]}
      >
        <TouchableOpacity
          style={styles.addActivityBtn}
          activeOpacity={0.8}
          onPress={() => {
            // Navigate to add-activity screen when available
          }}
        >
          <Ionicons name="add" size={18} color={Colors.primary} />
          <Text style={styles.addActivityText}>Add Activity</Text>
        </TouchableOpacity>

        {plan.status === 'upcoming' && (
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={handleMarkComplete}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={Colors.gradientPink as [string, string]}
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

  // Header
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
  headerBack: {
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
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Status badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Scroll
  scrollContent: {
    gap: Spacing.base,
    paddingTop: Spacing.base,
  },

  // Hero
  heroCard: {
    marginHorizontal: Spacing.base,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    minHeight: 140,
    overflow: 'hidden',
    position: 'relative',
  },
  heroOverlay: {
    gap: Spacing.sm,
    zIndex: 1,
  },
  heroDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroDate: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  countdownBadge: {
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  countdownText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.3,
  },
  heroIconCluster: {
    position: 'absolute',
    right: Spacing.xl,
    bottom: -10,
    opacity: 0.6,
  },

  // Budget card
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
  budgetIcon: {
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
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  budgetStatValue: {
    fontSize: 18,
    fontWeight: '800',
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
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionCount: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },

  // Timeline container
  timeline: {
    paddingHorizontal: Spacing.base,
    gap: 0,
  },

  // Timeline row
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

  // Timeline card
  timelineCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  timelineCardDone: {
    opacity: 0.65,
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
    letterSpacing: 0.4,
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
  timelineMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.gray50,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  timelineMetaText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },

  // Empty state
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

  // Notes
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

  // Bottom bar
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
    gap: 6,
  },
  completeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
});
