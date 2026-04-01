import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DatefullyStackParamList } from '../../navigation/DatefullyNavigator';
import { useDatefullyStore } from '../../stores/datefullyStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const GOLD = '#c9a84c';
const RED = '#c0392b';

type Nav = NativeStackNavigationProp<DatefullyStackParamList, 'DateOptions'>;

// ── floating heart particle ────────────────────────────────────────────────
const Heart = ({ anim, x, emoji }: { anim: Animated.Value; x: number; emoji: string }) => {
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -SCREEN_HEIGHT * 0.85] });
  const opacity = anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });
  return (
    <Animated.Text
      style={{
        position: 'absolute',
        bottom: 60,
        left: x,
        fontSize: 22,
        opacity,
        transform: [{ translateY }],
        zIndex: 999,
      }}
    >
      {emoji}
    </Animated.Text>
  );
};

// ── nav dots ──────────────────────────────────────────────────────────────
const NavDots = ({ total, current }: { total: number; current: number }) => (
  <View style={styles.dots}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          styles.dot,
          { width: i === current ? 16 : 6, backgroundColor: i === current ? RED : '#333' },
        ]}
      />
    ))}
  </View>
);

// ── date option card ──────────────────────────────────────────────────────
interface OptionData {
  label: string;
  title: string;
  venues: string;
  desc: string;
  cost: string;
  badge?: string;
  borderColor: string;
  showTopPick?: boolean;
}

const OptionCard = ({
  data,
  onBook,
}: {
  data: OptionData;
  onBook: () => void;
}) => (
  <View style={[styles.card, { borderColor: data.borderColor }]}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardLabel}>{data.label}</Text>
      {data.showTopPick && (
        <View style={styles.topPickBadge}>
          <Text style={styles.topPickText}>⭐ Top Pick</Text>
        </View>
      )}
    </View>
    <Text style={styles.cardTitle}>{data.title}</Text>
    <Text style={styles.cardVenues}>{data.venues}</Text>
    <Text style={styles.cardDesc}>{data.desc}</Text>
    <View style={styles.cardFooter}>
      <View style={styles.costBadge}>
        <Text style={styles.costText}>{data.cost}</Text>
      </View>
      {data.badge && (
        <View style={styles.freeBadge}>
          <Text style={styles.freeText}>{data.badge}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.bookBtn} onPress={onBook} activeOpacity={0.8}>
        <Text style={styles.bookBtnText}>Book It</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function DateOptionsScreen() {
  const navigation = useNavigation<Nav>();
  const { budget, setSelectedDateOption } = useDatefullyStore();
  const [hearts, setHearts] = useState<{ id: number; anim: Animated.Value; x: number; emoji: string }[]>([]);
  const heartIdRef = useRef(0);

  const options: OptionData[] = [
    {
      label: 'Option 1 — Best Match',
      title: 'Romantic Italian Evening + Jazz Bar',
      venues: 'Positano Coast · Tavern on Camac',
      desc: 'Start with candlelit Italian dining then end the night at a cozy jazz lounge.',
      cost: `~$${Math.min(budget, 120)}`,
      badge: 'Some free',
      borderColor: GOLD,
      showTopPick: true,
    },
    {
      label: 'Option 2 — Chill at Home',
      title: 'Cozy Night In',
      venues: 'Your place · Delivered to you',
      desc: 'Cook a meal together, movie marathon, candles & wine. Zero effort, maximum connection.',
      cost: '~$30',
      borderColor: RED,
    },
    {
      label: 'Option 3 — Splurge',
      title: 'Luxury Date Night',
      venues: 'Lacroix at The Rittenhouse · Rooftop Bar 1800',
      desc: 'Pull out all the stops — fine dining, skyline views, and a night to remember.',
      cost: `~$${budget > 300 ? budget : 300}`,
      badge: '✨ Premium',
      borderColor: '#333',
    },
  ];

  const triggerHearts = (optionIndex: number, onDone: () => void) => {
    const emojis = ['❤️', '✨', '💛', '❤️', '✨', '💖', '✨', '❤️'];
    const newHearts = emojis.map((emoji, i) => ({
      id: heartIdRef.current++,
      anim: new Animated.Value(0),
      x: Math.random() * (SCREEN_WIDTH - 40),
      emoji,
    }));
    setHearts((prev) => [...prev, ...newHearts]);
    const anims = newHearts.map((h) =>
      Animated.timing(h.anim, { toValue: 1, duration: 1800, useNativeDriver: true })
    );
    setSelectedDateOption(optionIndex);
    Animated.stagger(80, anims).start(() => {
      setHearts([]);
      onDone();
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* floating hearts */}
      {hearts.map((h) => (
        <Heart key={h.id} anim={h.anim} x={h.x} emoji={h.emoji} />
      ))}

      {/* back */}
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Your Perfect{'\n'}
          <Text style={{ color: GOLD }}>3 Dates</Text>
        </Text>
        <Text style={styles.sub}>Philadelphia, PA · Budget: ${budget}</Text>

        {options.map((opt, i) => (
          <OptionCard
            key={i}
            data={opt}
            onBook={() =>
              triggerHearts(i, () => navigation.navigate('Marketplace'))
            }
          />
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>

      <NavDots total={9} current={5} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  back: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  backText: { color: '#fff', fontSize: 17 },
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10 },
  heading: { color: '#fff', fontSize: 30, fontWeight: '700', marginBottom: 4 },
  sub: { color: GOLD, fontSize: 14, marginBottom: 20 },
  card: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    backgroundColor: '#0a0a0a',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardLabel: { color: '#888', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  topPickBadge: { backgroundColor: '#1a1200', borderWidth: 1, borderColor: GOLD, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  topPickText: { color: GOLD, fontSize: 11, fontWeight: '700' },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  cardVenues: { color: GOLD, fontSize: 13, marginBottom: 6 },
  cardDesc: { color: '#aaa', fontSize: 13, lineHeight: 19, marginBottom: 14 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  costBadge: { backgroundColor: '#1a1200', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: GOLD },
  costText: { color: GOLD, fontSize: 13, fontWeight: '700' },
  freeBadge: { backgroundColor: '#0a1a0a', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#27ae60' },
  freeText: { color: '#27ae60', fontSize: 12 },
  bookBtn: { marginLeft: 'auto', backgroundColor: RED, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  bookBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingBottom: 16 },
  dot: { height: 6, borderRadius: 3 },
});
