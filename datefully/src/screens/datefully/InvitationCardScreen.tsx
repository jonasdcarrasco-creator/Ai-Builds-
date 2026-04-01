import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DatefullyStackParamList } from '../../navigation/DatefullyNavigator';
import { useDatefullyStore } from '../../stores/datefullyStore';

const GOLD = '#c9a84c';
const RED = '#c0392b';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<DatefullyStackParamList, 'InvitationCard'>;

// ── floating hearts after send ────────────────────────────────────────────
const FloatHeart = ({ anim, x, emoji }: { anim: Animated.Value; x: number; emoji: string }) => {
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -SCREEN_HEIGHT * 0.9] });
  const opacity = anim.interpolate({ inputRange: [0, 0.75, 1], outputRange: [1, 1, 0] });
  return (
    <Animated.Text style={{ position: 'absolute', bottom: 80, left: x, fontSize: 20, opacity, transform: [{ translateY }], zIndex: 999 }}>
      {emoji}
    </Animated.Text>
  );
};

const NavDots = ({ total, current }: { total: number; current: number }) => (
  <View style={styles.dots}>
    {Array.from({ length: total }).map((_, i) => (
      <View key={i} style={[styles.dot, { width: i === current ? 16 : 6, backgroundColor: i === current ? RED : '#333' }]} />
    ))}
  </View>
);

export default function InvitationCardScreen() {
  const navigation = useNavigation<Nav>();
  const { selectedVendors, setInvitationSent } = useDatefullyStore();
  const hasVendors = selectedVendors.length > 0;

  // gold border glow pulse
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [sent, setSent] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; anim: Animated.Value; x: number; emoji: string }[]>([]);
  const heartId = useRef(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const borderOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const shadowRadius = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [4, 18] });

  const handleSend = () => {
    if (sent) return;
    setSent(true);
    setInvitationSent(true);

    const emojis = ['❤️', '✨', '💛', '❤️', '✨', '💖', '✨', '❤️', '💕', '✨'];
    const newHearts = emojis.map((emoji) => ({
      id: heartId.current++,
      anim: new Animated.Value(0),
      x: Math.random() * (SCREEN_WIDTH - 40),
      emoji,
    }));
    setHearts(newHearts);
    const anims = newHearts.map((h) =>
      Animated.timing(h.anim, { toValue: 1, duration: 1800, useNativeDriver: true })
    );
    Animated.stagger(60, anims).start(() => {
      setHearts([]);
      navigation.navigate('Confirmation');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {hearts.map((h) => (
        <FloatHeart key={h.id} anim={h.anim} x={h.x} emoji={h.emoji} />
      ))}

      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.heading}>Send the Invitation Card</Text>

        {/* animated invitation card */}
        <Animated.View style={[styles.cardWrapper, { borderColor: GOLD, opacity: borderOpacity }]}>
          {/* top gradient line */}
          <LinearGradient colors={['transparent', GOLD, 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradLine} />

          <View style={styles.cardInner}>
            <Text style={styles.inviteLabel}>YOU HAVE BEEN INVITED</Text>
            <Text style={styles.datefullyLogo}>Date<Text style={{ color: '#fff' }}>fully</Text></Text>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📅</Text>
              <Text style={styles.detailText}>Saturday, April 5th</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>🕕</Text>
              <Text style={styles.detailText}>6:00 PM</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>👗</Text>
              <Text style={styles.detailText}>Dress to impress</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📍</Text>
              <Text style={[styles.detailText, { color: GOLD, fontStyle: 'italic' }]}>Location is a surprise</Text>
            </View>

            {hasVendors && (
              <View style={styles.specialRow}>
                <Text style={styles.specialText}>✨ Something special is waiting for you...</Text>
              </View>
            )}
          </View>

          {/* bottom gradient line */}
          <LinearGradient colors={['transparent', GOLD, 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradLine} />
        </Animated.View>

        {/* send button */}
        <TouchableOpacity
          style={[styles.sendBtn, sent && styles.sendBtnSent]}
          onPress={handleSend}
          activeOpacity={0.85}
        >
          <Text style={styles.sendBtnText}>
            {sent ? '✓ Sent!' : '💌 Text to My Date'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => {
            setInvitationSent(false);
            navigation.navigate('Confirmation');
          }}
        >
          <Text style={styles.skipText}>Skip →</Text>
        </TouchableOpacity>

        <Text style={styles.note}>Every card shared is free marketing for Datefully ✦</Text>
      </View>

      <NavDots total={9} current={7} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  back: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  backText: { color: '#fff', fontSize: 17 },
  content: { flex: 1, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  heading: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 28, textAlign: 'center' },
  cardWrapper: {
    width: '100%',
    maxWidth: 340,
    borderWidth: 1.5,
    borderRadius: 16,
    backgroundColor: '#060606',
    overflow: 'hidden',
    marginBottom: 28,
  },
  gradLine: { height: 2, width: '100%' },
  cardInner: { paddingHorizontal: 28, paddingVertical: 24, alignItems: 'center' },
  inviteLabel: { color: GOLD, fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
  datefullyLogo: { color: GOLD, fontSize: 26, fontWeight: '800', marginBottom: 16 },
  divider: { width: 60, height: 1, backgroundColor: '#333', marginBottom: 20 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, alignSelf: 'flex-start' },
  detailIcon: { fontSize: 16, marginRight: 10, width: 24 },
  detailText: { color: '#fff', fontSize: 15 },
  specialRow: { marginTop: 16, backgroundColor: '#1a0505', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, alignSelf: 'stretch', alignItems: 'center' },
  specialText: { color: RED, fontSize: 13, fontStyle: 'italic', textAlign: 'center' },
  sendBtn: { backgroundColor: RED, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 40, alignItems: 'center', width: '100%', marginBottom: 14 },
  sendBtnSent: { backgroundColor: '#27ae60' },
  sendBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  skipBtn: { paddingVertical: 10 },
  skipText: { color: GOLD, fontSize: 15 },
  note: { color: '#555', fontSize: 12, fontStyle: 'italic', textAlign: 'center', marginTop: 20, paddingHorizontal: 10 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingBottom: 16 },
  dot: { height: 6, borderRadius: 3 },
});
