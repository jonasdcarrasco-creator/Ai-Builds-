import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  PanResponder,
  GestureResponderEvent,
  LayoutChangeEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { DatefullyStackParamList } from '../../navigation/DatefullyNavigator';
import { useDatefullyStore } from '../../stores/datefullyStore';

type NavProp = NativeStackNavigationProp<DatefullyStackParamList, 'Budget'>;

const SLIDER_MIN = 0;
const SLIDER_MAX = 500;

const NavDots = ({ total, current }: { total: number; current: number }) => (
  <View style={styles.navDotsContainer}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          styles.dot,
          {
            width: i === current ? 16 : 6,
            backgroundColor: i === current ? '#c0392b' : '#333',
          },
        ]}
      />
    ))}
  </View>
);

const QUICK_PICKS = [
  { label: 'Free', value: 0 },
  { label: 'Under $50', value: 40 },
  { label: '$50–$150', value: 100 },
  { label: '$150–$300', value: 225 },
  { label: '$300+', value: 400 },
  { label: 'Splurge', value: 500 },
];

function getQuickPickSelected(budget: number): string {
  if (budget === 0) return 'Free';
  if (budget <= 40) return 'Under $50';
  if (budget <= 150) return '$50–$150';
  if (budget <= 300) return '$150–$300';
  if (budget <= 490) return '$300+';
  if (budget >= 500) return 'Splurge';
  return '';
}

export default function BudgetScreen() {
  const navigation = useNavigation<NavProp>();
  const { budget, setBudget } = useDatefullyStore();
  const [sliderWidth, setSliderWidth] = useState(300);

  const thumbPosition = ((budget - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * sliderWidth;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e: GestureResponderEvent) => {
      const x = e.nativeEvent.locationX;
      const ratio = Math.min(1, Math.max(0, x / sliderWidth));
      const newBudget = Math.round(ratio * SLIDER_MAX);
      setBudget(newBudget);
    },
    onPanResponderMove: (e: GestureResponderEvent) => {
      const x = e.nativeEvent.locationX;
      const ratio = Math.min(1, Math.max(0, x / sliderWidth));
      const newBudget = Math.round(ratio * SLIDER_MAX);
      setBudget(newBudget);
    },
  });

  const onSliderLayout = (e: LayoutChangeEvent) => {
    setSliderWidth(e.nativeEvent.layout.width);
  };

  const selectedQuickPick = getQuickPickSelected(budget);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={26} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Heading */}
        <Text style={styles.heading}>What's your budget?</Text>

        {/* Amount Display */}
        <Text style={styles.budgetAmount}>
          {budget === 0 ? 'Free' : `$${budget}`}
        </Text>

        {/* Slider */}
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>$0</Text>
          <View
            style={styles.sliderTrack}
            onLayout={onSliderLayout}
            {...panResponder.panHandlers}
          >
            {/* Filled Track */}
            <View
              style={[
                styles.sliderFilled,
                { width: Math.max(0, thumbPosition) },
              ]}
            />
            {/* Thumb */}
            <View
              style={[
                styles.sliderThumb,
                { left: Math.max(0, Math.min(thumbPosition - 14, sliderWidth - 28)) },
              ]}
            />
          </View>
          <Text style={styles.sliderLabel}>$500</Text>
        </View>

        {/* Quick Pick Chips */}
        <Text style={styles.quickPickLabel}>QUICK PICK</Text>
        <View style={styles.chipsRow}>
          {QUICK_PICKS.map((qp) => {
            const isSelected = selectedQuickPick === qp.label;
            return (
              <TouchableOpacity
                key={qp.label}
                onPress={() => setBudget(qp.value)}
                activeOpacity={0.75}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? '#c0392b' : '#111',
                    borderColor: isSelected ? '#c0392b' : '#555',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isSelected ? '#fff' : '#888',
                      fontWeight: isSelected ? '600' : '400',
                    },
                  ]}
                >
                  {qp.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Bottom */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => navigation.navigate('PartnerProfile')}
          activeOpacity={0.85}
        >
          <Text style={styles.nextButtonText}>Next →</Text>
        </TouchableOpacity>
        <NavDots total={9} current={2} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  heading: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 32,
  },
  budgetAmount: {
    fontSize: 64,
    fontWeight: '800',
    color: '#c9a84c',
    textAlign: 'center',
    marginBottom: 40,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 40,
  },
  sliderLabel: {
    color: '#888888',
    fontSize: 12,
    width: 32,
    textAlign: 'center',
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    position: 'relative',
  },
  sliderFilled: {
    height: 6,
    backgroundColor: '#c9a84c',
    borderRadius: 3,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  sliderThumb: {
    position: 'absolute',
    top: -11,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#c9a84c',
    borderWidth: 3,
    borderColor: '#000000',
    shadowColor: '#c9a84c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  quickPickLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#c9a84c',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    margin: 4,
  },
  chipText: {
    fontSize: 13,
  },
  bottom: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  nextButton: {
    backgroundColor: '#c0392b',
    height: 56,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  navDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 20,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
