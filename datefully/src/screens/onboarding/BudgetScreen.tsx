import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const COLORS = {
  black: '#000000',
  deepRed: '#C0392B',
  gold: '#C9A84C',
  white: '#FFFFFF',
  darkSurface: '#111111',
};

const TRACK_HORIZONTAL_PADDING = 48;
const THUMB_SIZE = 22;
const MAX_VALUE = 500;

interface QuickPick {
  label: string;
  midpoint: number;
}

const QUICK_PICKS: QuickPick[] = [
  { label: '$0 Free', midpoint: 0 },
  { label: 'Under $50', midpoint: 25 },
  { label: '$50–$150', midpoint: 100 },
  { label: '$150–$300', midpoint: 225 },
  { label: '$300+ Splurge', midpoint: 400 },
];

interface Props {
  navigation: any;
}

export default function BudgetScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [budget, setBudget] = useState<number>(100);
  const [selectedQuickPick, setSelectedQuickPick] = useState<string>('$50–$150');
  const [trackWidth, setTrackWidth] = useState<number>(0);

  // Ref to track current budget during pan without stale closure
  const budgetRef = useRef<number>(100);
  const trackWidthRef = useRef<number>(0);

  const clamp = (val: number, min: number, max: number) =>
    Math.min(Math.max(val, min), max);

  const valueToPercent = (val: number) => val / MAX_VALUE;
  const percentToValue = (pct: number) => Math.round(clamp(pct, 0, 1) * MAX_VALUE);

  const getThumbLeft = () => {
    if (trackWidth === 0) return 0;
    const pct = valueToPercent(budget);
    return pct * (trackWidth - THUMB_SIZE);
  };

  const getFillWidth = () => {
    if (trackWidth === 0) return 0;
    const pct = valueToPercent(budget);
    return clamp(pct * trackWidth, 0, trackWidth);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        // Tap position within track
        const tw = trackWidthRef.current;
        if (tw === 0) return;
        const x = evt.nativeEvent.locationX;
        const pct = clamp(x / tw, 0, 1);
        const newVal = percentToValue(pct);
        budgetRef.current = newVal;
        setBudget(newVal);
        setSelectedQuickPick('');
      },
      onPanResponderMove: (evt, gestureState) => {
        const tw = trackWidthRef.current;
        if (tw === 0) return;
        // Use the current thumb position + dx
        const startPct = valueToPercent(budgetRef.current);
        const startX = startPct * tw;
        const newX = startX + gestureState.dx;
        const newPct = clamp(newX / tw, 0, 1);
        const newVal = percentToValue(newPct);
        setBudget(newVal);
        setSelectedQuickPick('');
      },
      onPanResponderRelease: (_, gestureState) => {
        const tw = trackWidthRef.current;
        if (tw === 0) return;
        const startPct = valueToPercent(budgetRef.current);
        const startX = startPct * tw;
        const newX = startX + gestureState.dx;
        const newPct = clamp(newX / tw, 0, 1);
        const newVal = percentToValue(newPct);
        budgetRef.current = newVal;
        setBudget(newVal);
      },
    })
  ).current;

  const handleTrackLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setTrackWidth(w);
    trackWidthRef.current = w;
  }, []);

  const handleQuickPick = (pick: QuickPick) => {
    setSelectedQuickPick(pick.label);
    budgetRef.current = pick.midpoint;
    setBudget(pick.midpoint);
  };

  const handleNext = () => {
    navigation.navigate('PartnerProfile', { budget });
  };

  const thumbLeft = getThumbLeft();
  const fillWidth = getFillWidth();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Header row */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>

        {/* Progress dots */}
        <View style={styles.progressDots}>
          {Array.from({ length: 9 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === 2 ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Spacer */}
        <View style={styles.backButtonSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Heading */}
        <Text style={styles.heading}>What's your budget?</Text>
        <Text style={styles.subtext}>We work with any budget — even $0</Text>

        {/* Live budget display */}
        <Text style={styles.budgetDisplay}>
          ${budget}
          {budget === MAX_VALUE ? '+' : ''}
        </Text>

        {/* Slider */}
        <View style={styles.sliderWrapper}>
          {/* Track — we attach PanResponder here */}
          <View
            style={styles.trackContainer}
            onLayout={handleTrackLayout}
            {...panResponder.panHandlers}
          >
            {/* Track background */}
            <View style={styles.track}>
              {/* Fill */}
              <View style={[styles.trackFill, { width: fillWidth }]} />
            </View>
            {/* Thumb */}
            {trackWidth > 0 && (
              <View
                style={[
                  styles.thumb,
                  {
                    left: thumbLeft,
                  },
                ]}
              />
            )}
          </View>

          {/* Labels */}
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>$0 Free</Text>
            <Text style={styles.sliderLabel}>$500+</Text>
          </View>
        </View>

        {/* Quick pick chips */}
        <View style={styles.quickPickRow}>
          {QUICK_PICKS.map((pick) => {
            const active = selectedQuickPick === pick.label;
            return (
              <TouchableOpacity
                key={pick.label}
                onPress={() => handleQuickPick(pick)}
                activeOpacity={0.75}
                style={[
                  styles.quickChip,
                  active ? styles.quickChipActive : styles.quickChipInactive,
                ]}
              >
                <Text
                  style={[
                    styles.quickChipText,
                    active
                      ? styles.quickChipTextActive
                      : styles.quickChipTextInactive,
                  ]}
                >
                  {pick.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Next button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? 8 : 24 }]}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonSpacer: {
    width: 36,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: COLORS.gold,
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#888',
    marginBottom: 36,
  },
  budgetDisplay: {
    fontSize: 64,
    fontWeight: 'bold',
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: 40,
  },
  sliderWrapper: {
    marginBottom: 36,
  },
  trackContainer: {
    height: THUMB_SIZE + 8,
    marginHorizontal: 0,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  trackFill: {
    height: 4,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    top: '50%',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: COLORS.gold,
    marginTop: -(THUMB_SIZE / 2),
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#555',
  },
  quickPickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  quickChipActive: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(201,168,76,0.15)',
  },
  quickChipInactive: {
    borderColor: '#2A2A2A',
    backgroundColor: COLORS.darkSurface,
  },
  quickChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  quickChipTextActive: {
    color: COLORS.gold,
  },
  quickChipTextInactive: {
    color: '#888',
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  nextButton: {
    backgroundColor: COLORS.deepRed,
    borderRadius: 28,
    paddingVertical: 17,
    alignItems: 'center',
    width: '100%',
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
});
