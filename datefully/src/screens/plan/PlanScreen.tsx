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
import { Colors, Spacing, BorderRadius } from '../../constants';
import { useAppStore, useAuthStore } from '../../store';
import { DatePlan } from '../../types';

interface PlanScreenProps {
  navigation: any;
}

const STATUS_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  upcoming: { bg: 'rgba(212,175,55,0.12)', text: '#D4AF37', border: 'rgba(212,175,55,0.3)' },
  completed: { bg: 'rgba(46,204,113,0.12)', text: '#2ECC71', border: 'rgba(46,204,113,0.3)' },
  cancelled: { bg: 'rgba(231,76,60,0.12)', text: '#E74C3C', border: 'rgba(231,76,60,0.3)' },
};

const TIPS = [
  { emoji: '🎯', text: 'Book restaurants 2–3 days in advance' },
  { emoji: '💡', text: 'Have a backup plan for outdoor activities' },
  { emoji: '💌', text: 'Add personal touches like a handwritten note' },
  { emoji: '📸', text: 'Capture memories with the Memories feature' },
];

export const PlanScreen: React.FC<PlanScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { plans, addPlan, deletePlan } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const upcoming = plans.filter((p) => p.status === 'upcoming');
  const past = plans.filter((p) => p.status !== 'upcoming');

  const handleCreate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Plan name is required';
    if (!date.trim()) e.date = 'Date is required';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    addPlan({
      id: Date.now().toString(),
      title: title.trim(),
      date: date.trim(),
      items: [],
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    });
    setTitle('');
    setDate('');
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Plan', 'This will permanently remove the plan.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePlan(id) },
    ]);
  };

  const PlanCard = ({ plan }: { plan: DatePlan }) => {
    const sc = STATUS_STYLE[plan.status] ?? STATUS_STYLE.upcoming;
    return (
      <View style={styles.planCard}>
        <View style={styles.planCardTop}>
          <View style={styles.planCardLeft}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <View style={styles.planDateRow}>
              <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
              <Text style={styles.planDateText}>{plan.date}</Text>
            </View>
          </View>
          <View style={[styles.statusPill, { backgroundColor: sc.bg, borderColor: sc.border }]}>
            <Text style={[styles.statusText, { color: sc.text }]}>
              {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
            </Text>
          </View>
        </View>

        {plan.items.length > 0 ? (
          <View style={styles.itemsBlock}>
            {plan.items.slice(0, 3).map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Ionicons
                  name={item.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                  size={14}
                  color={item.isCompleted ? Colors.primary : Colors.textMuted}
                />
                <Text
                  style={[styles.itemText, item.isCompleted && styles.itemDone]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
              </View>
            ))}
            {plan.items.length > 3 && (
              <Text style={styles.moreText}>+{plan.items.length - 3} more</Text>
            )}
          </View>
        ) : (
          <View style={styles.noItems}>
            <Text style={styles.noItemsText}>No activities yet — tap Edit to add some</Text>
          </View>
        )}

        {plan.totalBudget != null && (
          <View style={styles.budgetRow}>
            <Ionicons name="wallet-outline" size={13} color={Colors.primary} />
            <Text style={styles.budgetText}>
              Budget:{' '}
              <Text style={{ color: Colors.primary, fontWeight: '700' }}>
                ${plan.totalBudget}
              </Text>
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="pencil-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.actionLabel}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="share-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.actionLabel}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="images-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.actionLabel}>Memories</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteAction]}
            onPress={() => handleDelete(plan.id)}
          >
            <Ionicons name="trash-outline" size={14} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#0A0A0A', '#1C0000', '#0A0A0A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>My Plans</Text>
            <Text style={styles.headerSub}>
              {plans.length} plan{plans.length !== 1 ? 's' : ''} total
            </Text>
          </View>
          <TouchableOpacity onPress={() => setShowForm(!showForm)}>
            <LinearGradient
              colors={['#D4AF37', '#B8942A']}
              style={styles.addBtnGrad}
            >
              <Ionicons name={showForm ? 'close' : 'add'} size={22} color="#0A0A0A" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {showForm && (
          <View style={styles.createForm}>
            <Text style={styles.formHeading}>New Date Plan</Text>
            <View style={[styles.formRow, errors.title ? styles.formRowErr : null]}>
              <Ionicons name="bookmark-outline" size={16} color={Colors.textMuted} />
              <TextInput
                style={styles.formInput}
                placeholder="Plan name"
                placeholderTextColor={Colors.inputPlaceholder}
                value={title}
                onChangeText={setTitle}
              />
            </View>
            {errors.title ? <Text style={styles.errText}>{errors.title}</Text> : null}
            <View style={[styles.formRow, errors.date ? styles.formRowErr : null]}>
              <Ionicons name="today-outline" size={16} color={Colors.textMuted} />
              <TextInput
                style={styles.formInput}
                placeholder="Date (e.g. Jan 14, 2026)"
                placeholderTextColor={Colors.inputPlaceholder}
                value={date}
                onChangeText={setDate}
              />
            </View>
            {errors.date ? <Text style={styles.errText}>{errors.date}</Text> : null}
            <View style={styles.formActions}>
              <TouchableOpacity style={styles.formCancel} onPress={() => setShowForm(false)}>
                <Text style={styles.formCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.formCreateWrap} onPress={handleCreate}>
                <LinearGradient
                  colors={['#D4AF37', '#B8942A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.formCreate}
                >
                  <Text style={styles.formCreateText}>Create</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {plans.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyTitle}>No Plans Yet</Text>
            <Text style={styles.emptySub}>
              Create your first date plan to start building unforgettable memories together
            </Text>
            <TouchableOpacity onPress={() => setShowForm(true)}>
              <LinearGradient
                colors={['#D4AF37', '#B8942A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emptyBtn}
              >
                <Ionicons name="add" size={18} color="#0A0A0A" />
                <Text style={styles.emptyBtnText}>Create First Plan</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {upcoming.length > 0 && (
              <View style={styles.section}>
                <View style={styles.secRow}>
                  <Text style={styles.sectionTitle}>Upcoming</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{upcoming.length}</Text>
                  </View>
                </View>
                {upcoming.map((p) => <PlanCard key={p.id} plan={p} />)}
              </View>
            )}
            {past.length > 0 && (
              <View style={styles.section}>
                <View style={styles.secRow}>
                  <Text style={styles.sectionTitle}>Past Dates</Text>
                  <View style={[styles.badge, { backgroundColor: Colors.surfaceAlt }]}>
                    <Text style={[styles.badgeText, { color: Colors.textMuted }]}>{past.length}</Text>
                  </View>
                </View>
                {past.map((p) => <PlanCard key={p.id} plan={p} />)}
              </View>
            )}
          </>
        )}

        {/* Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Planning Tips</Text>
          <View style={styles.tipsCard}>
            {TIPS.map((t, i) => (
              <View
                key={i}
                style={[styles.tipRow, i < TIPS.length - 1 && styles.tipDivider]}
              >
                <Text style={styles.tipEmoji}>{t.emoji}</Text>
                <Text style={styles.tipText}>{t.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['2xl'],
    gap: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Spacing.base,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  headerSub: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  addBtnGrad: {
    width: 48, height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createForm: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  formHeading: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
  },
  formRowErr: { borderColor: Colors.error },
  formInput: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  errText: { fontSize: 11, color: Colors.error, marginLeft: 4, marginTop: -6 },
  formActions: { flexDirection: 'row', gap: 10 },
  formCancel: {
    flex: 1, height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  formCancelText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
  formCreateWrap: { flex: 1.5, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  formCreate: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
  },
  formCreateText: { fontSize: 14, fontWeight: '700', color: '#0A0A0A' },
  section: { paddingHorizontal: Spacing['2xl'], paddingTop: Spacing['2xl'] },
  secRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.base,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  badge: {
    backgroundColor: Colors.secondary,
    width: 22, height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: Spacing.md,
  },
  planCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planCardLeft: { flex: 1, gap: 4 },
  planTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  planDateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  planDateText: { fontSize: 13, color: Colors.textMuted },
  statusPill: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  itemsBlock: { gap: 6 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemText: { flex: 1, fontSize: 13, color: Colors.textSecondary },
  itemDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  moreText: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  noItems: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    padding: 12,
    alignItems: 'center',
  },
  noItemsText: { fontSize: 12, color: Colors.textMuted, fontStyle: 'italic' },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(212,175,55,0.07)',
    padding: 10,
    borderRadius: BorderRadius.md,
  },
  budgetText: { fontSize: 13, color: Colors.textSecondary },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.inputBorder,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceAlt,
  },
  deleteAction: { marginLeft: 'auto', backgroundColor: 'rgba(231,76,60,0.1)' },
  actionLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  empty: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
    gap: 14,
  },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  emptySub: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: BorderRadius.xl,
    marginTop: 8,
  },
  emptyBtnText: { fontSize: 15, fontWeight: '700', color: '#0A0A0A' },
  tipsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  tipDivider: { borderBottomWidth: 1, borderBottomColor: Colors.inputBorder },
  tipEmoji: { fontSize: 22 },
  tipText: { flex: 1, fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
});
