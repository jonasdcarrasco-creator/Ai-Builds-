import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useDateStore } from '../store';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import ScreenContainer from '../components/common/ScreenContainer';
import RomanticTipCard from '../components/common/RomanticTip';
import { getTip } from '../data/romanticTips';

const { width } = Dimensions.get('window');
const TRACK_WIDTH = width - Spacing.screen * 2 - Spacing.xl * 2;
const SLIDER_MAX = 500;

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Budget'> };

const QUICK_PICKS = [
  { label: 'Free', value: 0 },
  { label: 'Under $50', value: 45 },
  { label: '$50–$150', value: 100 },
  { label: '$150–$300', value: 200 },
  { label: '$300+ Splurge', value: 350 },
];

export default function BudgetScreen({ navigation }: Props) {
  const { budget, setBudget, planningFor } = useDateStore();
  const [sliderVal, setSliderVal] = useState(budget);
  const sliderRef = useRef(0);

  const tip = getTip('budget', planningFor === 'two_men' ? 'him' : planningFor === 'two_women' ? 'her' : 'both');

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gs) => {
        sliderRef.current = sliderVal;
      },
      onPanResponderMove: (_, gs) => {
        const ratio = Math.max(0, Math.min(1, gs.moveX / TRACK_WIDTH));
        const newVal = Math.round(ratio * SLIDER_MAX / 10) * 10;
        setSliderVal(newVal);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const thumbPos = (sliderVal / SLIDER_MAX) * TRACK_WIDTH;
  const budgetLabel = sliderVal >= 500 ? '$500+' : `$${sliderVal}`;

  const handleContinue = () => {
    setBudget(sliderVal);
    if (sliderVal < 20) {
      navigation.navigate('BudgetTooLow');
    } else {
      navigation.navigate('PartnerProfile');
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>What's your budget?</Text>
        <Text style={styles.subtitle}>We'll plan around what works for you</Text>
      </View>

      <View style={styles.body}>
        {/* Big budget display */}
        <View style={styles.budgetDisplay}>
          <Text style={styles.budgetAmount}>{budgetLabel}</Text>
          <Text style={styles.budgetLabel}>per person</Text>
        </View>

        {/* Slider track */}
        <View style={styles.sliderContainer} {...panResponder.panHandlers}>
          <View style={styles.track}>
            <View style={[styles.trackFill, { width: thumbPos }]} />
            <View style={[styles.thumb, { left: thumbPos - 14 }]} />
          </View>
          <View style={styles.trackLabels}>
            <Text style={styles.trackLabel}>$0</Text>
            <Text style={styles.trackLabel}>$500+</Text>
          </View>
        </View>

        {/* Quick picks */}
        <Text style={styles.quickLabel}>Quick pick</Text>
        <View style={styles.quickRow}>
          {QUICK_PICKS.map((q) => {
            const active = sliderVal === q.value;
            return (
              <TouchableOpacity
                key={q.label}
                style={[styles.quickChip, active && styles.quickChipActive]}
                onPress={() => setSliderVal(q.value)}
                activeOpacity={0.8}
              >
                <Text style={[styles.quickChipText, active && styles.quickChipTextActive]}>{q.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <RomanticTipCard tip={tip} />
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.88}>
          <Text style={styles.continueBtnText}>Continue — {budgetLabel}</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.screen, paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  backBtn: { marginBottom: Spacing.md },
  backText: { color: Colors.gold, fontSize: Typography.base },
  title: { fontFamily: Typography.heading, fontSize: Typography.xxl, color: Colors.textPrimary, marginBottom: 4 },
  subtitle: { color: Colors.textSecondary, fontSize: Typography.sm },
  body: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.screen },
  budgetDisplay: { alignItems: 'center', marginBottom: Spacing.xxl },
  budgetAmount: { fontFamily: Typography.heading, fontSize: 72, color: Colors.gold, lineHeight: 80 },
  budgetLabel: { color: Colors.textMuted, fontSize: Typography.sm, marginTop: 4 },
  sliderContainer: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xxl },
  track: { height: 6, backgroundColor: Colors.cardBorder, borderRadius: 3, position: 'relative' },
  trackFill: { position: 'absolute', top: 0, left: 0, height: 6, backgroundColor: Colors.gold, borderRadius: 3 },
  thumb: {
    position: 'absolute', top: -11, width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.gold, borderWidth: 3, borderColor: Colors.background,
    shadowColor: Colors.gold, shadowRadius: 6, shadowOpacity: 0.5, elevation: 5,
  },
  trackLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.sm },
  trackLabel: { color: Colors.textMuted, fontSize: Typography.xs },
  quickLabel: { color: Colors.textSecondary, fontSize: Typography.sm, fontWeight: Typography.semibold, marginBottom: Spacing.sm },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  quickChip: {
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.pill, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
  },
  quickChipActive: { borderColor: Colors.gold, backgroundColor: 'rgba(201,168,76,0.12)' },
  quickChipText: { color: Colors.textSecondary, fontSize: Typography.sm },
  quickChipTextActive: { color: Colors.gold, fontWeight: Typography.semibold },
  footer: { paddingBottom: Spacing.md },
  continueBtn: {
    backgroundColor: Colors.red, borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg, alignItems: 'center', marginHorizontal: Spacing.screen, marginBottom: Spacing.sm,
  },
  continueBtnText: { color: Colors.white, fontSize: Typography.base, fontWeight: Typography.bold },
});
