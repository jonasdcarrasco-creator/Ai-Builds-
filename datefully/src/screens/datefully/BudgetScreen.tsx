import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Animated,
  LayoutChangeEvent,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { DatefullyStackParamList } from '../../types';
import { useDatePlannerStore } from '../../store/datePlannerStore';
import { Chip } from '../../components/common/Chip';
import { Colors } from '../../constants/colors';

type Nav = NativeStackNavigationProp<DatefullyStackParamList, 'Budget'>;

const MIN = 0;
const MAX = 500;
const QUICK_PICKS = [25, 50, 100, 150, 200, 300];

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val));
}

function BudgetSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const trackWidth = useRef(0);
  const thumbX = useRef(new Animated.Value(0)).current;
  const isDragging = useRef(false);

  const pct = (value - MIN) / (MAX - MIN);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      trackWidth.current = e.nativeEvent.layout.width;
      thumbX.setValue(pct * trackWidth.current);
    },
    [pct]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        isDragging.current = true;
        const x = e.nativeEvent.locationX;
        const clamped = clamp(x, 0, trackWidth.current);
        const newVal = Math.round((clamped / trackWidth.current) * (MAX - MIN) + MIN);
        thumbX.setValue(clamped);
        onChange(newVal);
      },
      onPanResponderMove: (_, state) => {
        const pctVal = (value - MIN) / (MAX - MIN);
        const startX = pctVal * trackWidth.current;
        const x = clamp(startX + state.dx, 0, trackWidth.current);
        const newVal = Math.round((x / trackWidth.current) * (MAX - MIN) + MIN);
        thumbX.setValue(x);
        onChange(newVal);
      },
    })
  ).current;

  const thumbLeft = pct * 100;

  return (
    <View style={sliderStyles.wrapper} onLayout={onLayout} {...panResponder.panHandlers}>
      {/* Track */}
      <View style={sliderStyles.track}>
        <View style={[sliderStyles.fill, { width: `${thumbLeft}%` }]} />
      </View>
      {/* Thumb */}
      <View style={[sliderStyles.thumb, { left: `${thumbLeft}%` }]}>
        <View style={sliderStyles.thumbInner} />
      </View>
    </View>
  );
}

export function BudgetScreen() {
  const navigation = useNavigation<Nav>();
  const { budget, setBudget } = useDatePlannerStore();

  const handleQuickPick = (val: number) => setBudget(val);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '33%' }]} />
          </View>
          <Text style={styles.stepLabel}>Step 2 of 6</Text>
        </View>

        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>What's your budget?</Text>
          <Text style={styles.subtitle}>We'll curate the best options for you.</Text>

          {/* Big dollar display */}
          <View style={styles.amountContainer}>
            <Text style={styles.currencySign}>$</Text>
            <Text style={styles.amountText}>{budget}</Text>
          </View>

          {/* Slider */}
          <View style={styles.sliderSection}>
            <Text style={styles.sliderLabel}>${MIN}</Text>
            <BudgetSlider value={budget} onChange={setBudget} />
            <Text style={styles.sliderLabel}>${MAX}</Text>
          </View>

          {/* Range label */}
          <Text style={styles.rangeHint}>
            {budget === 0
              ? 'Free dates only'
              : budget <= 50
              ? 'Budget-friendly options'
              : budget <= 150
              ? 'A lovely evening out'
              : budget <= 300
              ? 'Premium experience'
              : 'Full luxury treatment'}
          </Text>

          {/* Quick picks */}
          <Text style={styles.quickLabel}>Quick pick</Text>
          <View style={styles.quickRow}>
            {QUICK_PICKS.map((val) => (
              <Chip
                key={val}
                label={`$${val}`}
                selected={budget === val}
                onPress={() => handleQuickPick(val)}
                style={styles.quickChip}
              />
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('PartnerProfile')}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 6,
    backgroundColor: '#2a2a2a',
    borderRadius: 3,
    overflow: 'visible',
  },
  fill: {
    height: 6,
    backgroundColor: Colors.gold,
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    width: 28,
    height: 28,
    marginLeft: -14,
    borderRadius: 14,
    backgroundColor: Colors.deepRed,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.deepRed,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
    top: -11,
  },
  thumbInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.white,
  },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.black },
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 6,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#222',
    borderRadius: 2,
  },
  progressFill: {
    height: 3,
    backgroundColor: Colors.gold,
    borderRadius: 2,
  },
  stepLabel: {
    fontSize: 12,
    color: Colors.textDim,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textMuted,
    marginBottom: 32,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 32,
  },
  currencySign: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.gold,
    marginTop: 8,
  },
  amountText: {
    fontSize: 80,
    fontWeight: '800',
    color: Colors.gold,
    letterSpacing: -3,
    lineHeight: 86,
    textShadowColor: 'rgba(201,168,76,0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 16,
  },
  sliderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sliderLabel: {
    fontSize: 12,
    color: Colors.textDim,
    width: 32,
    textAlign: 'center',
  },
  rangeHint: {
    textAlign: 'center',
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 36,
    letterSpacing: 0.2,
  },
  quickLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 16,
    backgroundColor: Colors.black,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  continueBtn: {
    backgroundColor: Colors.deepRed,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.deepRed,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.4,
  },
});
