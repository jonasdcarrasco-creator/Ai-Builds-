// ─── Screen 11 — Anniversary & Special Occasions ─────────────────────────────
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert, Platform, Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, SpecialOccasion, OccasionType } from '../types';
import ScreenContainer from '../components/common/ScreenContainer';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { useDateStore } from '../store/dateStore';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Anniversary'>;

// ─── Occasion type config ─────────────────────────────────────────────────────
const OCCASION_TYPES: { type: OccasionType; emoji: string; label: string; hint: string }[] = [
  { type: 'anniversary', emoji: '💍', label: 'Anniversary', hint: 'Your relationship anniversary' },
  { type: 'birthday', emoji: '🎂', label: "Partner's Birthday", hint: "Your partner's birthday" },
  { type: 'first_date_anniversary', emoji: '💌', label: 'First Date Anniversary', hint: 'When you first met' },
  { type: 'custom', emoji: '⭐', label: 'Custom Occasion', hint: 'A date that matters to you' },
];

// Days until a recurring annual date
function daysUntilAnnual(dateStr: string): number {
  const now = new Date();
  const [, mm, dd] = dateStr.split('-').map(Number);
  const thisYear = new Date(now.getFullYear(), mm - 1, dd);
  if (thisYear < now) thisYear.setFullYear(now.getFullYear() + 1);
  return Math.ceil((thisYear.getTime() - now.getTime()) / 86_400_000);
}

function daysLabel(d: number): string {
  if (d === 0) return '🎉 Today!';
  if (d === 1) return '🔔 Tomorrow!';
  if (d <= 7) return `⚡ ${d} days away`;
  return `${d} days away`;
}

function urgencyColor(d: number): string {
  if (d <= 1) return Colors.error;
  if (d <= 7) return Colors.warning;
  if (d <= 30) return Colors.gold;
  return Colors.textSecondary;
}

// ─── Add Occasion Modal ───────────────────────────────────────────────────────
function AddOccasionModal({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (o: Omit<SpecialOccasion, 'id' | 'userId' | 'reminderSent'>) => void;
}) {
  const [selectedType, setSelectedType] = useState<OccasionType>('anniversary');
  const [label, setLabel] = useState('');
  const [date, setDate] = useState(''); // YYYY-MM-DD

  function handleAdd() {
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert('Invalid date', 'Please enter a date in YYYY-MM-DD format.');
      return;
    }
    const typeConfig = OCCASION_TYPES.find((t) => t.type === selectedType)!;
    onAdd({
      type: selectedType,
      label: label.trim() || typeConfig.label,
      date,
    });
    setLabel('');
    setDate('');
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          <Text style={modal.title}>Add Occasion</Text>

          {/* Type picker */}
          <View style={modal.typeGrid}>
            {OCCASION_TYPES.map((t) => (
              <TouchableOpacity
                key={t.type}
                style={[modal.typeBtn, selectedType === t.type && modal.typeBtnActive]}
                onPress={() => setSelectedType(t.type)}
                activeOpacity={0.8}
              >
                <Text style={modal.typeEmoji}>{t.emoji}</Text>
                <Text style={[modal.typeLabel, selectedType === t.type && modal.typeLabelActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Label input (for custom) */}
          {selectedType === 'custom' && (
            <TextInput
              style={modal.input}
              placeholder="Occasion name..."
              placeholderTextColor={Colors.textMuted}
              value={label}
              onChangeText={setLabel}
              maxLength={40}
            />
          )}

          {/* Date input */}
          <Text style={modal.inputLabel}>Date (YYYY-MM-DD)</Text>
          <TextInput
            style={modal.input}
            placeholder="e.g. 2024-06-15"
            placeholderTextColor={Colors.textMuted}
            value={date}
            onChangeText={setDate}
            keyboardType="numeric"
            maxLength={10}
          />

          <Text style={modal.hintText}>
            📲 We'll remind you 7 days before this occasion every year.
          </Text>

          <View style={modal.btnRow}>
            <TouchableOpacity style={modal.cancelBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={modal.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modal.addBtn} onPress={handleAdd} activeOpacity={0.85}>
              <Text style={modal.addText}>Save Occasion</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 36 : Spacing.xl,
    gap: Spacing.md,
  },
  title: {
    fontFamily: Typography.heading,
    fontSize: Typography.xl,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  typeBtnActive: { borderColor: Colors.gold, backgroundColor: 'rgba(201,168,76,0.12)' },
  typeEmoji: { fontSize: 16 },
  typeLabel: { fontSize: 12, color: Colors.textSecondary },
  typeLabelActive: { color: Colors.gold, fontWeight: '600' },
  inputLabel: { fontSize: 12, color: Colors.textMuted, marginBottom: -8 },
  input: {
    backgroundColor: Colors.cardAlt,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: Typography.base,
  },
  hintText: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  btnRow: { flexDirection: 'row', gap: Spacing.sm },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  cancelText: { color: Colors.textSecondary, fontSize: Typography.base },
  addBtn: {
    flex: 1,
    backgroundColor: Colors.red,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  addText: { color: Colors.white, fontSize: Typography.base, fontWeight: Typography.bold },
});

// ─── Occasion Card ────────────────────────────────────────────────────────────
function OccasionCard({
  occasion,
  onDelete,
  onPlan,
}: {
  occasion: SpecialOccasion;
  onDelete: () => void;
  onPlan: () => void;
}) {
  const typeConfig = OCCASION_TYPES.find((t) => t.type === occasion.type);
  const days = daysUntilAnnual(occasion.date);
  const color = urgencyColor(days);

  return (
    <View style={[card.wrap, days <= 7 && card.urgent]}>
      <View style={card.row}>
        <Text style={card.emoji}>{typeConfig?.emoji ?? '⭐'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={card.label}>{occasion.label}</Text>
          <Text style={card.date}>{occasion.date}</Text>
          <Text style={[card.days, { color }]}>{daysLabel(days)}</Text>
        </View>
        <TouchableOpacity onPress={onDelete} style={card.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={card.deleteText}>✕</Text>
        </TouchableOpacity>
      </View>

      {days <= 30 && (
        <TouchableOpacity style={card.planBtn} onPress={onPlan} activeOpacity={0.85}>
          <Text style={card.planBtnText}>Plan a date for this →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const card = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  urgent: { borderColor: Colors.gold },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  emoji: { fontSize: 28, width: 36, textAlign: 'center' },
  label: {
    fontFamily: Typography.heading,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  date: { fontSize: Typography.sm, color: Colors.textMuted },
  days: { fontSize: Typography.sm, fontWeight: Typography.semibold, marginTop: 4 },
  deleteBtn: { padding: 4 },
  deleteText: { fontSize: 16, color: Colors.textMuted },
  planBtn: {
    backgroundColor: 'rgba(201,168,76,0.1)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)',
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  planBtnText: { color: Colors.gold, fontSize: Typography.sm, fontWeight: Typography.semibold },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AnniversaryScreen() {
  const navigation = useNavigation<Nav>();
  const { specialOccasions, addSpecialOccasion, removeSpecialOccasion, setOccasion } = useDateStore();
  const [showModal, setShowModal] = useState(false);

  // Sort upcoming first
  const sorted = [...specialOccasions].sort(
    (a, b) => daysUntilAnnual(a.date) - daysUntilAnnual(b.date),
  );

  function handleAdd(o: Omit<SpecialOccasion, 'id' | 'userId' | 'reminderSent'>) {
    const newOccasion: SpecialOccasion = {
      ...o,
      id: `occ_${Date.now()}`,
      userId: 'local',
      reminderSent: false,
    };
    addSpecialOccasion(newOccasion);

    Alert.alert(
      '🔔 Reminder Set',
      `We'll remind you 7 days before "${o.label}" every year. Make sure notifications are enabled for Datefully.`,
      [{ text: 'Got it' }],
    );
  }

  function handleDelete(id: string) {
    Alert.alert('Remove Occasion', 'Are you sure you want to remove this occasion?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeSpecialOccasion(id!) },
    ]);
  }

  function handlePlan(occasion: SpecialOccasion) {
    // Map occasion type to app Occasion enum
    const occasionMap: Record<OccasionType, string> = {
      anniversary: 'Anniversary',
      birthday: 'Just Because',
      first_date_anniversary: 'Anniversary',
      custom: 'Just Because',
    };
    setOccasion(occasionMap[occasion.type] as any);
    navigation.navigate('WhosPlanning');
  }

  return (
    <ScreenContainer>
      <AddOccasionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAdd}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Special Occasions</Text>
            <Text style={styles.subtitle}>Never forget what matters</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)} activeOpacity={0.8}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Notification tip */}
        <View style={styles.notifBanner}>
          <Text style={styles.notifIcon}>🔔</Text>
          <Text style={styles.notifText}>
            Enable notifications so we can remind you 7 days before each occasion.
          </Text>
        </View>

        {/* Occasions list */}
        <View style={styles.listArea}>
          {sorted.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>💌</Text>
              <Text style={styles.emptyTitle}>No occasions saved yet</Text>
              <Text style={styles.emptySubtitle}>
                Add anniversaries, birthdays, and special dates. We'll remind you 7 days before
                so you have time to plan something special.
              </Text>
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={() => setShowModal(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.emptyAddText}>Add Your First Occasion</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {sorted.map((o) => (
                <OccasionCard
                  key={o.id}
                  occasion={o}
                  onDelete={() => handleDelete(o.id!)}
                  onPlan={() => handlePlan(o)}
                />
              ))}
            </>
          )}
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Date Planning Tips</Text>
          {[
            'Book venues 2–3 weeks ahead for anniversaries.',
            'Add your first date anniversary for a nostalgic re-enactment date.',
            "For birthdays, let us know the year — we'll personalize the date for them.",
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipDot}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Plan a date CTA */}
        <TouchableOpacity
          style={styles.planBtn}
          onPress={() => navigation.navigate('WhosPlanning')}
          activeOpacity={0.85}
        >
          <Text style={styles.planBtnText}>Plan a Date Now →</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: { paddingRight: 4 },
  backArrow: { fontSize: 32, color: Colors.textPrimary, lineHeight: 36 },
  title: { fontFamily: Typography.heading, fontSize: 22, color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.red,
  },
  addBtnText: { color: Colors.white, fontWeight: Typography.bold, fontSize: 14 },

  notifBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(201,168,76,0.07)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.2)',
  },
  notifIcon: { fontSize: 16 },
  notifText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  listArea: { paddingHorizontal: 20 },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: Spacing.md,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: {
    fontFamily: Typography.heading,
    fontSize: Typography.xl,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  emptyAddBtn: {
    backgroundColor: Colors.red,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  emptyAddText: {
    color: Colors.white,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },

  tipsCard: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    padding: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: Spacing.sm,
  },
  tipsTitle: {
    fontFamily: Typography.heading,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  tipRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  tipDot: { color: Colors.gold, fontSize: 14, lineHeight: 20 },
  tipText: { flex: 1, fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 20 },

  planBtn: {
    marginHorizontal: 20,
    backgroundColor: Colors.red,
    borderRadius: BorderRadius.lg,
    paddingVertical: 15,
    alignItems: 'center',
  },
  planBtnText: {
    color: Colors.white,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    letterSpacing: 0.3,
  },
});
