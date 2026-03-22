import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Linking,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { DatefullyStackParamList, DateOption } from '../../types';
import { useDatePlannerStore } from '../../store/datePlannerStore';
import { getDateOptionsForBudget } from '../../store/datePlannerStore';
import { Colors } from '../../constants/colors';

type Nav = NativeStackNavigationProp<DatefullyStackParamList, 'Results'>;

function DateOptionCard({
  option,
  index,
  onBook,
}: {
  option: DateOption;
  index: number;
  onBook: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleOpenTable = () => {
    if (option.openTableUrl) {
      Linking.openURL(option.openTableUrl);
    }
  };

  return (
    <Animated.View
      style={[
        cardStyles.card,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Emoji header */}
      <View style={cardStyles.emojiHeader}>
        <Text style={cardStyles.emoji}>{option.emoji}</Text>
        <View style={[cardStyles.badge, option.isPaid ? cardStyles.paidBadge : cardStyles.freeBadge]}>
          <Text style={[cardStyles.badgeText, option.isPaid ? cardStyles.paidText : cardStyles.freeText]}>
            {option.isPaid ? 'Paid' : 'Free'}
          </Text>
        </View>
      </View>

      {/* Name & category */}
      <Text style={cardStyles.name}>{option.name}</Text>
      <Text style={cardStyles.category}>{option.category}</Text>

      {/* Description */}
      <Text style={cardStyles.description}>{option.description}</Text>

      {/* Cost row */}
      <View style={cardStyles.costRow}>
        <View style={cardStyles.costChip}>
          <Ionicons name="cash-outline" size={14} color={Colors.gold} />
          <Text style={cardStyles.costText}>Est. ${option.estimatedCost}</Text>
        </View>
        {option.openTableUrl && (
          <TouchableOpacity style={cardStyles.openTableBtn} onPress={handleOpenTable}>
            <Ionicons name="calendar-outline" size={13} color={Colors.white} />
            <Text style={cardStyles.openTableText}>OpenTable</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Book it button */}
      <TouchableOpacity style={cardStyles.bookBtn} activeOpacity={0.85} onPress={onBook}>
        <Text style={cardStyles.bookBtnText}>Book it</Text>
        <Ionicons name="heart" size={16} color={Colors.white} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ResultsScreen() {
  const navigation = useNavigation<Nav>();
  const { budget, setSelectedDate } = useDatePlannerStore();
  const dateOptions = getDateOptionsForBudget(budget);

  const handleBook = (option: DateOption) => {
    setSelectedDate(option);
    navigation.navigate('Confirmation', { dateOption: option });
  };

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
            <View style={[styles.progressFill, { width: '66%' }]} />
          </View>
          <Text style={styles.stepLabel}>Step 4 of 6</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={styles.title}>Your Perfect Dates</Text>
          <Text style={styles.subtitle}>
            Curated for your budget of{' '}
            <Text style={styles.budgetHighlight}>${budget}</Text>
          </Text>

          {/* Date cards */}
          {dateOptions.map((option, index) => (
            <DateOptionCard
              key={option.id}
              option={option}
              index={index}
              onBook={() => handleBook(option)}
            />
          ))}

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#0d0d0d',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e1e1e',
  },
  emojiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: { fontSize: 36 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
  },
  paidBadge: { borderColor: Colors.deepRed, backgroundColor: 'rgba(192,57,43,0.1)' },
  freeBadge: { borderColor: Colors.success, backgroundColor: 'rgba(46,204,113,0.1)' },
  badgeText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.4 },
  paidText: { color: Colors.deepRed },
  freeText: { color: Colors.success },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  category: { fontSize: 13, color: Colors.gold, fontWeight: '600', marginBottom: 12 },
  description: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 21,
    marginBottom: 16,
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  costChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(201,168,76,0.1)',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
  },
  costText: { fontSize: 13, color: Colors.gold, fontWeight: '600' },
  openTableBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1a3a2a',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#2ecc7140',
  },
  openTableText: { fontSize: 12, color: Colors.white, fontWeight: '600' },
  bookBtn: {
    backgroundColor: Colors.deepRed,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.deepRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  bookBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.3,
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
  progressBar: { height: 3, backgroundColor: '#222', borderRadius: 2 },
  progressFill: { height: 3, backgroundColor: Colors.gold, borderRadius: 2 },
  stepLabel: { fontSize: 12, color: Colors.textDim, letterSpacing: 0.5 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 24 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: 6,
    paddingHorizontal: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textMuted,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  budgetHighlight: { color: Colors.gold, fontWeight: '700' },
});
