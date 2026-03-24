import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Shadow } from '../../constants';
import { useAppStore } from '../../store';
import { DatePlan } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreatePlanScreenProps {
  navigation: any;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MOODS = ['Romantic', 'Adventure', 'Chill', 'Foodie', 'Surprise'] as const;
type MoodOption = typeof MOODS[number];

const BUDGET_OPTIONS = ['$', '$$', '$$$', '$$$$'] as const;
type BudgetOption = typeof BUDGET_OPTIONS[number];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function addDays(date: Date, delta: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + delta);
  return d;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ label: string; required?: boolean }> = ({
  label,
  required,
}) => (
  <View style={sectionStyles.row}>
    <Text style={sectionStyles.label}>{label}</Text>
    {required && <Text style={sectionStyles.required}>Required</Text>}
  </View>
);

const sectionStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  required: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: 0.2,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const CreatePlanScreen: React.FC<CreatePlanScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { addPlan } = useAppStore();

  // ── Form state ──────────────────────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [time, setTime] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<BudgetOption | null>(null);
  const [notes, setNotes] = useState('');
  const [titleError, setTitleError] = useState(false);

  const titleRef = useRef<TextInput>(null);
  const timeRef = useRef<TextInput>(null);
  const notesRef = useRef<TextInput>(null);

  const canCreate = title.trim().length > 0;

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleDateStep = useCallback((delta: number) => {
    setSelectedDate((prev) => {
      const next = addDays(prev, delta);
      // Don't allow going before today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return next < today ? prev : next;
    });
  }, []);

  const handleCreate = useCallback(() => {
    if (!title.trim()) {
      setTitleError(true);
      titleRef.current?.focus();
      Alert.alert('Missing Title', 'Please give your date plan a name before creating it.');
      return;
    }

    const plan: DatePlan = {
      id: `plan_${Date.now()}`,
      title: title.trim(),
      date: toISODateString(selectedDate),
      time: time.trim() || undefined,
      notes: notes.trim() || undefined,
      items: [],
      totalBudget: undefined,
      status: 'upcoming',
      coverImage: undefined,
      createdAt: new Date().toISOString(),
    };

    addPlan(plan);
    navigation.goBack();
  }, [title, selectedDate, time, notes, addPlan, navigation]);

  const handleClose = useCallback(() => {
    if (title.trim() || notes.trim() || selectedMood || selectedBudget || time.trim()) {
      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          { text: 'Keep editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [title, notes, selectedMood, selectedBudget, time, navigation]);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerSideBtn}
            onPress={handleClose}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>New Date Plan</Text>

          <TouchableOpacity
            style={[styles.createHeaderBtn, !canCreate && styles.createHeaderBtnDisabled]}
            onPress={handleCreate}
            disabled={!canCreate}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={canCreate ? ['#FF6B9D', '#E85585'] : [Colors.gray200, Colors.gray300]}
              style={styles.createHeaderBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[styles.createHeaderBtnText, !canCreate && styles.createHeaderBtnTextDisabled]}>
                Create
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing['3xl'] },
          ]}
        >

          {/* ── Cover Photo Placeholder ──────────────────────────────────── */}
          <TouchableOpacity style={styles.coverPhoto} activeOpacity={0.8}>
            <LinearGradient
              colors={['#FFF0F6', '#FFE4EF']}
              style={styles.coverPhotoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.coverPhotoIconWrap}>
                <Ionicons name="camera-outline" size={28} color={Colors.primary} />
              </View>
              <Text style={styles.coverPhotoLabel}>Add cover photo</Text>
              <Text style={styles.coverPhotoSub}>Tap to select from your library</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* ── Form Fields ──────────────────────────────────────────────── */}
          <View style={styles.form}>

            {/* Plan Title */}
            <View style={styles.fieldGroup}>
              <SectionLabel label="Plan Title" required />
              <View
                style={[
                  styles.titleInputWrap,
                  titleError && styles.titleInputWrapError,
                  title.length > 0 && styles.titleInputWrapFocused,
                ]}
              >
                <Ionicons
                  name="heart-outline"
                  size={20}
                  color={titleError ? Colors.error : title.length > 0 ? Colors.primary : Colors.textMuted}
                />
                <TextInput
                  ref={titleRef}
                  style={styles.titleInput}
                  placeholder="Give your date a name..."
                  placeholderTextColor={Colors.inputPlaceholder}
                  value={title}
                  onChangeText={(text) => {
                    setTitle(text);
                    if (titleError && text.trim().length > 0) setTitleError(false);
                  }}
                  returnKeyType="next"
                  onSubmitEditing={() => timeRef.current?.focus()}
                  autoFocus
                  maxLength={80}
                />
                {title.length > 0 && (
                  <TouchableOpacity onPress={() => setTitle('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle" size={18} color={Colors.gray400} />
                  </TouchableOpacity>
                )}
              </View>
              {titleError && (
                <Text style={styles.errorText}>A title is required to create your plan</Text>
              )}
            </View>

            {/* Date Picker */}
            <View style={styles.fieldGroup}>
              <SectionLabel label="Date" />
              <View style={[styles.datePickerRow, Shadow.sm]}>
                <TouchableOpacity
                  style={styles.dateStepBtn}
                  onPress={() => handleDateStep(-1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-back" size={20} color={Colors.primary} />
                </TouchableOpacity>

                <View style={styles.dateDisplay}>
                  <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
                  <Text style={styles.dateDisplayText}>
                    {formatDisplayDate(selectedDate)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.dateStepBtn}
                  onPress={() => handleDateStep(1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Time */}
            <View style={styles.fieldGroup}>
              <SectionLabel label="Time" />
              <View style={styles.inputRow}>
                <Ionicons name="time-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  ref={timeRef}
                  style={styles.rowInput}
                  placeholder="7:00 PM"
                  placeholderTextColor={Colors.inputPlaceholder}
                  value={time}
                  onChangeText={setTime}
                  returnKeyType="next"
                  onSubmitEditing={() => notesRef.current?.focus()}
                />
              </View>
            </View>

            {/* Mood / Vibe Selector */}
            <View style={styles.fieldGroup}>
              <SectionLabel label="Mood / Vibe" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipScroll}
              >
                {MOODS.map((mood) => {
                  const isSelected = selectedMood === mood;
                  return (
                    <TouchableOpacity
                      key={mood}
                      onPress={() => setSelectedMood(isSelected ? null : mood)}
                      activeOpacity={0.8}
                    >
                      {isSelected ? (
                        <LinearGradient
                          colors={['#FF6B9D', '#E85585']}
                          style={styles.moodChipSelected}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          <Text style={styles.moodChipTextSelected}>{mood}</Text>
                        </LinearGradient>
                      ) : (
                        <View style={styles.moodChip}>
                          <Text style={styles.moodChipText}>{mood}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Budget Range */}
            <View style={styles.fieldGroup}>
              <SectionLabel label="Budget Range" />
              <View style={styles.budgetSegment}>
                {BUDGET_OPTIONS.map((option, index) => {
                  const isSelected = selectedBudget === option;
                  const isFirst = index === 0;
                  const isLast = index === BUDGET_OPTIONS.length - 1;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.budgetSegmentItem,
                        isFirst && styles.budgetSegmentFirst,
                        isLast && styles.budgetSegmentLast,
                        isSelected && styles.budgetSegmentSelected,
                      ]}
                      onPress={() => setSelectedBudget(isSelected ? null : option)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.budgetSegmentText,
                          isSelected && styles.budgetSegmentTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Notes */}
            <View style={styles.fieldGroup}>
              <SectionLabel label="Notes" />
              <View style={[styles.notesWrap, notes.length > 0 && styles.notesWrapFocused]}>
                <TextInput
                  ref={notesRef}
                  style={styles.notesInput}
                  placeholder="Any special details, surprises, or reminders for this date..."
                  placeholderTextColor={Colors.inputPlaceholder}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  returnKeyType="default"
                  maxLength={500}
                />
                <Text style={styles.notesCounter}>{notes.length}/500</Text>
              </View>
            </View>

          </View>

          {/* ── Create Button (bottom of scroll) ─────────────────────────── */}
          <TouchableOpacity
            style={styles.createBtn}
            onPress={handleCreate}
            activeOpacity={0.85}
          >
            {canCreate ? (
              <LinearGradient
                colors={['#FF6B9D', '#E85585']}
                style={styles.createBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="sparkles" size={18} color={Colors.white} />
                <Text style={styles.createBtnText}>Create Date Plan</Text>
              </LinearGradient>
            ) : (
              <View style={styles.createBtnDisabled}>
                <Ionicons name="sparkles-outline" size={18} color={Colors.gray400} />
                <Text style={styles.createBtnTextDisabled}>Enter a title to continue</Text>
              </View>
            )}
          </TouchableOpacity>

        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  headerSideBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  createHeaderBtn: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    minWidth: 72,
  },
  createHeaderBtnDisabled: {
    opacity: 0.55,
  },
  createHeaderBtnGradient: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createHeaderBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  createHeaderBtnTextDisabled: {
    color: Colors.gray500,
  },

  // ── Scroll
  scrollContent: {
    gap: 0,
  },

  // ── Cover photo
  coverPhoto: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.primaryLight + '50',
    borderStyle: 'dashed',
  },
  coverPhotoGradient: {
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  coverPhotoIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 107, 157, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  coverPhotoLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  coverPhotoSub: {
    fontSize: 12,
    color: Colors.textMuted,
  },

  // ── Form
  form: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.xl,
  },
  fieldGroup: {
    gap: 0,
  },

  // ── Title input
  titleInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
  },
  titleInputWrapFocused: {
    borderColor: Colors.inputBorderFocus,
    backgroundColor: Colors.white,
  },
  titleInputWrapError: {
    borderColor: Colors.error,
    backgroundColor: Colors.white,
  },
  titleInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: Spacing.xs,
    marginLeft: 4,
    fontWeight: '500',
  },

  // ── Date picker
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  dateStepBtn: {
    width: 48,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceAlt,
  },
  dateDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.md,
  },
  dateDisplayText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },

  // ── Row input (time)
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
  },
  rowInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },

  // ── Mood chips
  chipScroll: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingRight: Spacing.base,
  },
  moodChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.gray300,
    backgroundColor: Colors.white,
  },
  moodChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  moodChipSelected: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
  },
  moodChipTextSelected: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },

  // ── Budget segmented control
  budgetSegment: {
    flexDirection: 'row',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.lg,
    padding: 3,
    gap: 2,
  },
  budgetSegmentItem: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  budgetSegmentFirst: {
    borderTopLeftRadius: BorderRadius.md,
    borderBottomLeftRadius: BorderRadius.md,
  },
  budgetSegmentLast: {
    borderTopRightRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
  },
  budgetSegmentSelected: {
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  budgetSegmentText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  budgetSegmentTextSelected: {
    color: Colors.primary,
    fontWeight: '800',
  },

  // ── Notes
  notesWrap: {
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    gap: Spacing.sm,
  },
  notesWrapFocused: {
    borderColor: Colors.inputBorderFocus,
    backgroundColor: Colors.white,
  },
  notesInput: {
    fontSize: 15,
    color: Colors.textPrimary,
    minHeight: 96,
    lineHeight: 22,
  },
  notesCounter: {
    alignSelf: 'flex-end',
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },

  // ── Bottom create button
  createBtn: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing['2xl'],
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  createBtnGradient: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.2,
  },
  createBtnDisabled: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.xl,
  },
  createBtnTextDisabled: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray400,
  },
});
