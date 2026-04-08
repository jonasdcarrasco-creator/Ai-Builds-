import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, CoupleType, Occasion, TimeOfDay } from '../types';
import { useDateStore } from '../store';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import ScreenContainer from '../components/common/ScreenContainer';
import RomanticTipCard from '../components/common/RomanticTip';
import { getTip, getPairedTip } from '../data/romanticTips';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'WhosPlanning'> };

const COUPLE_TYPES: { type: CoupleType; label: string; emoji: string }[] = [
  { type: 'couple', label: 'Couple', emoji: '👫' },
  { type: 'two_women', label: 'Two Women', emoji: '👭' },
  { type: 'two_men', label: 'Two Men', emoji: '👬' },
  { type: 'surprise', label: 'Surprise', emoji: '🎉' },
  { type: 'family', label: 'Family Date', emoji: '👨‍👩‍👧' },
  { type: 'solo', label: 'Solo', emoji: '👤' },
];

const OCCASIONS: { label: Occasion; emoji: string }[] = [
  { label: 'Anniversary', emoji: '💍' },
  { label: 'First Date', emoji: '🌹' },
  { label: 'Just Because', emoji: '💛' },
  { label: 'Surprise', emoji: '🎁' },
  { label: 'Apology Date', emoji: '🙏' },
  { label: 'Teen Date', emoji: '✨' },
  { label: 'Proposal', emoji: '💎' },
  { label: 'Family Date', emoji: '👨‍👩‍👧' },
];

const TIME_OF_DAY: { type: TimeOfDay; label: string; emoji: string; range: string }[] = [
  { type: 'morning', label: 'Morning', emoji: '🌅', range: '6am – 12pm' },
  { type: 'afternoon', label: 'Afternoon', emoji: '☀️', range: '12 – 5pm' },
  { type: 'evening', label: 'Evening', emoji: '🌇', range: '5 – 10pm' },
  { type: 'late_night', label: 'Late Night', emoji: '🌙', range: '10pm+' },
];

export default function WhosPlanning({ navigation }: Props) {
  const { planningFor, occasion, timeOfDay, setPlanningFor, setOccasion, setTimeOfDay } = useDateStore();
  const [selType, setSelType] = useState<CoupleType>(planningFor);
  const [selOccasion, setSelOccasion] = useState<Occasion | null>(occasion);
  const [selTime, setSelTime] = useState<TimeOfDay>(timeOfDay);
  const btnScale = useRef(new Animated.Value(1)).current;

  const genderHint: 'him' | 'her' | 'both' =
    selType === 'two_men' ? 'him' : selType === 'two_women' ? 'her' : 'both';
  const tip = getTip('whosPlanning', genderHint);
  const pairedTip = genderHint !== 'both' ? getPairedTip('whosPlanning', genderHint) : null;

  const handleContinue = () => {
    if (!selOccasion) return;
    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(btnScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    setPlanningFor(selType);
    setOccasion(selOccasion);
    setTimeOfDay(selTime);
    navigation.navigate('Budget');
  };

  return (
    <ScreenContainer>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Who's Planning?</Text>
          <Text style={styles.subtitle}>Tell us about you two</Text>
        </View>

        {/* Couple type */}
        <Text style={styles.sectionLabel}>Planning for</Text>
        <View style={styles.chipGrid}>
          {COUPLE_TYPES.map((ct) => {
            const active = selType === ct.type;
            return (
              <TouchableOpacity
                key={ct.type}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelType(ct.type)}
                activeOpacity={0.8}
              >
                <Text style={styles.chipEmoji}>{ct.emoji}</Text>
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{ct.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Occasion */}
        <Text style={styles.sectionLabel}>What's the occasion?</Text>
        <View style={styles.chipGrid}>
          {OCCASIONS.map((oc) => {
            const active = selOccasion === oc.label;
            return (
              <TouchableOpacity
                key={oc.label}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelOccasion(oc.label)}
                activeOpacity={0.8}
              >
                <Text style={styles.chipEmoji}>{oc.emoji}</Text>
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{oc.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Time of day */}
        <Text style={styles.sectionLabel}>What time of day?</Text>
        <View style={styles.timeGrid}>
          {TIME_OF_DAY.map((t) => {
            const active = selTime === t.type;
            return (
              <TouchableOpacity
                key={t.type}
                style={[styles.timeCard, active && styles.timeCardActive]}
                onPress={() => setSelTime(t.type)}
                activeOpacity={0.8}
              >
                <Text style={styles.timeEmoji}>{t.emoji}</Text>
                <Text style={[styles.timeLabel, active && styles.timeLabelActive]}>{t.label}</Text>
                <Text style={styles.timeRange}>{t.range}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Romantic tip */}
        <RomanticTipCard tip={tip} pairedTip={pairedTip} />

        {/* Continue */}
        <Animated.View style={{ transform: [{ scale: btnScale }], marginHorizontal: Spacing.screen, marginBottom: Spacing.xl }}>
          <TouchableOpacity
            style={[styles.continueBtn, !selOccasion && styles.continueBtnDisabled]}
            onPress={handleContinue}
            disabled={!selOccasion}
            activeOpacity={0.88}
          >
            <Text style={styles.continueBtnText}>
              {selOccasion ? `Continue — ${selOccasion}` : 'Select an occasion'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xxxl },
  header: { paddingHorizontal: Spacing.screen, paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  backBtn: { marginBottom: Spacing.md },
  backText: { color: Colors.gold, fontSize: Typography.base },
  title: { fontFamily: Typography.heading, fontSize: Typography.xxl, color: Colors.textPrimary, marginBottom: 4 },
  subtitle: { color: Colors.textSecondary, fontSize: Typography.sm },
  sectionLabel: { color: Colors.textPrimary, fontSize: Typography.base, fontWeight: Typography.semibold, paddingHorizontal: Spacing.screen, marginBottom: Spacing.sm, marginTop: Spacing.md },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.screen, gap: Spacing.sm, marginBottom: Spacing.sm },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.pill, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
  },
  chipActive: { borderColor: Colors.gold, backgroundColor: 'rgba(201,168,76,0.12)' },
  chipEmoji: { fontSize: 15 },
  chipLabel: { color: Colors.textSecondary, fontSize: Typography.sm, fontWeight: Typography.medium },
  chipLabelActive: { color: Colors.gold, fontWeight: Typography.semibold },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.screen, gap: Spacing.sm, marginBottom: Spacing.xl },
  timeCard: {
    flex: 1, minWidth: '44%', alignItems: 'center',
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.lg, paddingVertical: Spacing.lg, gap: 4,
  },
  timeCardActive: { borderColor: Colors.gold, backgroundColor: 'rgba(201,168,76,0.1)' },
  timeEmoji: { fontSize: 26 },
  timeLabel: { color: Colors.textSecondary, fontSize: Typography.base, fontWeight: Typography.semibold },
  timeLabelActive: { color: Colors.gold },
  timeRange: { color: Colors.textMuted, fontSize: Typography.xs },
  continueBtn: { backgroundColor: Colors.red, borderRadius: BorderRadius.lg, paddingVertical: Spacing.lg, alignItems: 'center' },
  continueBtnDisabled: { backgroundColor: Colors.cardAlt },
  continueBtnText: { color: Colors.white, fontSize: Typography.base, fontWeight: Typography.bold },
});
