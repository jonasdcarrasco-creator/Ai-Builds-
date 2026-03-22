import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Shadow } from '../../constants';
import { useAppStore } from '../../store';
import { DatePlan, DatePlanItem } from '../../types';
import { MOCK_PLANS } from '../../constants/mockData';

interface PlanScreenProps {
  navigation: any;
}

export const PlanScreen: React.FC<PlanScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { plans, addPlan } = useAppStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanDate, setNewPlanDate] = useState('');

  const allPlans = plans.length > 0 ? plans : MOCK_PLANS;

  const handleCreatePlan = () => {
    if (!newPlanTitle.trim()) {
      Alert.alert('', 'Please enter a title for your date plan.');
      return;
    }
    const plan: DatePlan = {
      id: Date.now().toString(),
      title: newPlanTitle.trim(),
      date: newPlanDate || new Date().toISOString().split('T')[0],
      items: [],
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    };
    addPlan(plan);
    setNewPlanTitle('');
    setNewPlanDate('');
    setShowCreate(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return Colors.info;
      case 'completed': return Colors.success;
      case 'cancelled': return Colors.error;
      default: return Colors.gray400;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'completed': return 'Completed ✓';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.base }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Date Plans</Text>
            <Text style={styles.headerSubtitle}>
              {allPlans.length} plan{allPlans.length !== 1 ? 's' : ''} created
            </Text>
          </View>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => setShowCreate(!showCreate)}
          >
            <Ionicons
              name={showCreate ? 'close' : 'add'}
              size={22}
              color={Colors.white}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Create Plan Inline Form */}
        {showCreate && (
          <View style={[styles.createForm, Shadow.md]}>
            <Text style={styles.createFormTitle}>New Date Plan ✨</Text>
            <View style={styles.inputRow}>
              <Ionicons name="heart-outline" size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.formInput}
                placeholder="Give your date a name..."
                placeholderTextColor={Colors.textMuted}
                value={newPlanTitle}
                onChangeText={setNewPlanTitle}
                autoFocus
              />
            </View>
            <View style={styles.inputRow}>
              <Ionicons name="calendar-outline" size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.formInput}
                placeholder="Date (e.g. April 15, 2026)"
                placeholderTextColor={Colors.textMuted}
                value={newPlanDate}
                onChangeText={setNewPlanDate}
              />
            </View>
            <View style={styles.formBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCreate(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleCreatePlan}>
                <LinearGradient
                  colors={['#FF6B9D', '#E85585']}
                  style={styles.saveBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.saveBtnText}>Create Plan</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Upcoming Plans */}
        {allPlans.filter((p) => p.status === 'upcoming').length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Upcoming Dates</Text>
            {allPlans
              .filter((p) => p.status === 'upcoming')
              .map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onPress={() => {}}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                  formatDate={formatDate}
                />
              ))}
          </>
        )}

        {/* Past Plans */}
        {allPlans.filter((p) => p.status !== 'upcoming').length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>Past Dates</Text>
            {allPlans
              .filter((p) => p.status !== 'upcoming')
              .map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onPress={() => {}}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                  formatDate={formatDate}
                />
              ))}
          </>
        )}

        {allPlans.length === 0 && !showCreate && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyTitle}>No date plans yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to create your first date plan and start building unforgettable memories.
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowCreate(true)}>
              <LinearGradient
                colors={['#FF6B9D', '#E85585']}
                style={styles.emptyBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="add" size={18} color={Colors.white} />
                <Text style={styles.emptyBtnText}>Create First Plan</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsSectionTitle}>Planning Tips 💡</Text>
          {[
            { icon: '🎯', tip: 'Be specific — the more details, the better the experience.' },
            { icon: '⏰', tip: 'Book reservations at least 3 days in advance for popular spots.' },
            { icon: '💰', tip: 'Set a budget early to avoid stress and focus on fun.' },
            { icon: '📸', tip: 'Designate one activity as the "signature moment" to photograph.' },
          ].map((t, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipIcon}>{t.icon}</Text>
              <Text style={styles.tipText}>{t.tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const PlanCard: React.FC<{
  plan: DatePlan;
  onPress: () => void;
  getStatusColor: (s: string) => string;
  getStatusLabel: (s: string) => string;
  formatDate: (d: string) => string;
}> = ({ plan, onPress, getStatusColor, getStatusLabel, formatDate }) => (
  <TouchableOpacity style={[styles.planCard, Shadow.md]} onPress={onPress} activeOpacity={0.9}>
    <LinearGradient
      colors={['#FF6B9D20', '#9B59B610']}
      style={styles.planCardGradient}
    >
      <View style={styles.planCardHeader}>
        <View style={styles.planCardLeft}>
          <Text style={styles.planCardTitle}>{plan.title}</Text>
          <View style={styles.planCardDate}>
            <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.planCardDateText}>{formatDate(plan.date)}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(plan.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(plan.status) }]}>
            {getStatusLabel(plan.status)}
          </Text>
        </View>
      </View>

      {plan.items.length > 0 && (
        <View style={styles.planItems}>
          {plan.items.slice(0, 3).map((item) => (
            <View key={item.id} style={styles.planItem}>
              <View style={[styles.planItemDot, item.isCompleted && styles.planItemDotDone]} />
              <Text style={[styles.planItemText, item.isCompleted && styles.planItemTextDone]}>
                {item.time ? `${item.time} · ` : ''}{item.title}
              </Text>
            </View>
          ))}
          {plan.items.length > 3 && (
            <Text style={styles.moreItems}>+{plan.items.length - 3} more activities</Text>
          )}
        </View>
      )}

      {plan.totalBudget != null && (
        <View style={styles.planFooter}>
          <Ionicons name="cash-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.planBudget}>
            Total budget: <Text style={styles.planBudgetAmount}>${plan.totalBudget}</Text>
          </Text>
        </View>
      )}

      <View style={styles.planCardActions}>
        <TouchableOpacity style={styles.planAction}>
          <Ionicons name="pencil-outline" size={14} color={Colors.primary} />
          <Text style={styles.planActionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.planAction}>
          <Ionicons name="share-outline" size={14} color={Colors.primary} />
          <Text style={styles.planActionText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.planAction}>
          <Ionicons name="camera-outline" size={14} color={Colors.primary} />
          <Text style={styles.planActionText}>Memories</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  createBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createForm: {
    margin: Spacing.base,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  createFormTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  formInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  formBtns: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveBtn: {
    flex: 2,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  saveBtnGradient: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  planCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.white,
  },
  planCardGradient: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  planCardLeft: {
    flex: 1,
    gap: 6,
  },
  planCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  planCardDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  planCardDateText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  planItems: {
    gap: 6,
    paddingLeft: 4,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planItemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  planItemDotDone: {
    backgroundColor: Colors.success,
  },
  planItemText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  planItemTextDone: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  moreItems: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 14,
  },
  planFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  planBudget: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  planBudgetAmount: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  planCardActions: {
    flexDirection: 'row',
    gap: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  planAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  planActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing['3xl'],
    gap: Spacing.md,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyBtn: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  emptyBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  emptyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  tipsSection: {
    margin: Spacing.base,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  tipsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  tipRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 18,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
