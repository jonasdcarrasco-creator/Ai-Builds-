import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Linking,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as MailComposer from 'expo-mail-composer';
import { DatefullyStackParamList } from '../../types';
import { useDatePlannerStore } from '../../store/datePlannerStore';
import { Colors } from '../../constants/colors';

type Nav = NativeStackNavigationProp<DatefullyStackParamList, 'Confirmation'>;
type RouteType = RouteProp<DatefullyStackParamList, 'Confirmation'>;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const HEART_COUNT = 18;

// ─── Falling Heart ────────────────────────────────────────────────────────────

function FallingHeart({ delay, x }: { delay: number; x: number }) {
  const translateY = useRef(new Animated.Value(-60)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.4 + Math.random() * 0.8)).current;
  const rotate = useRef(new Animated.Value((Math.random() - 0.5) * 30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, {
          toValue: SCREEN_H + 60,
          duration: 2800 + Math.random() * 1400,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const rotateStr = rotate.interpolate({
    inputRange: [-30, 30],
    outputRange: ['-30deg', '30deg'],
  });

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        left: x,
        top: 0,
        fontSize: 20 + Math.random() * 18,
        opacity,
        transform: [{ translateY }, { scale }, { rotate: rotateStr }],
      }}
    >
      ❤️
    </Animated.Text>
  );
}

// ─── Transport tile ───────────────────────────────────────────────────────────

interface TransportOption {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

function TransportTile({ label, icon, color, onPress }: TransportOption) {
  return (
    <TouchableOpacity style={[tileStyles.tile, { borderColor: color + '44' }]} onPress={onPress} activeOpacity={0.75}>
      <View style={[tileStyles.iconWrap, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={tileStyles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function ConfirmationScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteType>();
  const { dateOption } = route.params;
  const store = useDatePlannerStore();

  const [hearts] = useState(() =>
    Array.from({ length: HEART_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * (SCREEN_W - 40),
      delay: Math.random() * 2000,
    }))
  );

  const cardScale = useRef(new Animated.Value(0.85)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Card entrance
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

  }, []);

  const handleEmailConfirmation = async () => {
    const isAvailable = await MailComposer.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert(
        'Mail Not Available',
        'Please set up a mail account in Settings to send confirmations.'
      );
      return;
    }
    await MailComposer.composeAsync({
      subject: `Your Datefully booking: ${dateOption.name}`,
      body: `Hi there!\n\nYour date has been booked! 🎉\n\n📅 Date: ${dateOption.name}\n📝 ${dateOption.description}\n💰 Estimated cost: $${dateOption.estimatedCost}\n\nHave an amazing time!\n\n— The Datefully Team\nPlan it. Make it unforgettable.`,
    });
  };

  const TRANSPORT: TransportOption[] = [
    {
      label: 'Walk',
      icon: 'walk-outline',
      color: Colors.success,
      onPress: () => {},
    },
    {
      label: 'Uber',
      icon: 'car-outline',
      color: '#1a1aff',
      onPress: () => {
        Linking.openURL('uber://').catch(() =>
          Linking.openURL('https://m.uber.com')
        );
      },
    },
    {
      label: 'Lyft',
      icon: 'car-sport-outline',
      color: '#ff00bf',
      onPress: () => {
        Linking.openURL('lyft://').catch(() =>
          Linking.openURL('https://www.lyft.com')
        );
      },
    },
    {
      label: 'Taxi',
      icon: 'car-sharp',
      color: Colors.gold,
      onPress: () => {},
    },
    {
      label: 'Transit',
      icon: 'bus-outline',
      color: '#3498db',
      onPress: () => {},
    },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />

      {/* Falling hearts — rendered behind everything */}
      <View style={styles.heartsLayer} pointerEvents="none">
        {hearts.map((h) => (
          <FallingHeart key={h.id} x={h.x} delay={h.delay} />
        ))}
      </View>

      <SafeAreaView style={styles.safe}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Big heart */}
          <View style={styles.heroHeart}>
            <Text style={styles.bigHeart}>❤️</Text>
          </View>

          {/* Headline */}
          <Text style={styles.headline}>It's a Date!</Text>
          <Text style={styles.subHeadline}>
            Your perfect evening is booked and waiting.
          </Text>

          {/* Date summary card */}
          <Animated.View
            style={[
              styles.summaryCard,
              { transform: [{ scale: cardScale }], opacity: cardOpacity },
            ]}
          >
            <Text style={styles.summaryEmoji}>{dateOption.emoji}</Text>
            <Text style={styles.summaryName}>{dateOption.name}</Text>
            <Text style={styles.summaryCategory}>{dateOption.category}</Text>
            <View style={styles.summaryDivider} />
            <Text style={styles.summaryDesc}>{dateOption.description}</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryChip}>
                <Ionicons name="cash-outline" size={14} color={Colors.gold} />
                <Text style={styles.summaryChipText}>Est. ${dateOption.estimatedCost}</Text>
              </View>
              <View
                style={[
                  styles.summaryChip,
                  dateOption.isPaid ? styles.paidChip : styles.freeChip,
                ]}
              >
                <Text
                  style={[
                    styles.summaryChipText,
                    { color: dateOption.isPaid ? Colors.deepRed : Colors.success },
                  ]}
                >
                  {dateOption.isPaid ? 'Paid Experience' : 'Free Event'}
                </Text>
              </View>
            </View>

            {/* Planner context */}
            <View style={styles.plannerInfo}>
              {store.plannerType && (
                <Text style={styles.plannerInfoText}>👤 {store.plannerType}</Text>
              )}
              {store.occasion && (
                <Text style={styles.plannerInfoText}>🎉 {store.occasion}</Text>
              )}
              {store.vibeChips.length > 0 && (
                <Text style={styles.plannerInfoText}>
                  ✨ {store.vibeChips.join(' · ')}
                </Text>
              )}
            </View>
          </Animated.View>

          {/* Email confirmation */}
          <TouchableOpacity
            style={styles.emailBtn}
            activeOpacity={0.8}
            onPress={handleEmailConfirmation}
          >
            <Ionicons name="mail-outline" size={18} color={Colors.gold} />
            <Text style={styles.emailBtnText}>Send Email Confirmation</Text>
          </TouchableOpacity>
          <Text style={styles.emailHint}>A beautiful summary will be sent to your inbox.</Text>

          {/* Transport section */}
          <Text style={styles.transportTitle}>How are you getting there?</Text>
          <View style={styles.transportGrid}>
            {TRANSPORT.map((t) => (
              <TransportTile key={t.label} {...t} />
            ))}
          </View>

          {/* Start over */}
          <TouchableOpacity
            style={styles.startOverBtn}
            activeOpacity={0.75}
            onPress={() => {
              store.reset();
              navigation.navigate('Splash');
            }}
          >
            <Text style={styles.startOverText}>Plan Another Date</Text>
          </TouchableOpacity>

          <View style={{ height: 48 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const tileStyles = StyleSheet.create({
  tile: {
    width: '29%',
    aspectRatio: 1,
    backgroundColor: '#0d0d0d',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    margin: '2%',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.black },
  heartsLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  safe: { flex: 1, zIndex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 32, alignItems: 'center' },
  heroHeart: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(192,57,43,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  bigHeart: { fontSize: 50 },
  headline: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -1,
    textAlign: 'center',
    marginBottom: 8,
  },
  subHeadline: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: '#0d0d0d',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.2)',
    marginBottom: 20,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  summaryEmoji: { fontSize: 40, marginBottom: 10 },
  summaryName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  summaryCategory: {
    fontSize: 13,
    color: Colors.gold,
    fontWeight: '600',
    marginBottom: 14,
  },
  summaryDivider: { height: 1, backgroundColor: '#1e1e1e', marginBottom: 14 },
  summaryDesc: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 21,
    marginBottom: 16,
  },
  summaryRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 14 },
  summaryChip: {
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
  paidChip: {
    backgroundColor: 'rgba(192,57,43,0.1)',
    borderColor: 'rgba(192,57,43,0.25)',
  },
  freeChip: {
    backgroundColor: 'rgba(46,204,113,0.1)',
    borderColor: 'rgba(46,204,113,0.25)',
  },
  summaryChipText: { fontSize: 13, color: Colors.gold, fontWeight: '600' },
  plannerInfo: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  plannerInfoText: { fontSize: 13, color: Colors.textMuted, lineHeight: 20 },
  emailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.gold,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 13,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emailBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.gold,
    letterSpacing: 0.3,
  },
  emailHint: {
    fontSize: 12,
    color: Colors.textDim,
    textAlign: 'center',
    marginBottom: 28,
  },
  transportTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    alignSelf: 'flex-start',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  transportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    marginHorizontal: -8,
    marginBottom: 24,
    justifyContent: 'flex-start',
  },
  startOverBtn: {
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 13,
    marginTop: 4,
  },
  startOverText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
