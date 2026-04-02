import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useDateStore } from '../store';
import { shareInvitationText } from '../lib/booking';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'InvitationCard'>;
};

const { width, height } = Dimensions.get('window');
const PARTICLE_COUNT = 20;

function StarParticles() {
  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 2 + Math.random() * 3,
      anim: new Animated.Value(0.2 + Math.random() * 0.5),
      duration: 1500 + Math.random() * 2000,
      delay: Math.random() * 1500,
    }))
  ).current;

  useEffect(() => {
    particles.forEach((p) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.delay(p.delay),
          Animated.timing(p.anim, { toValue: 1, duration: p.duration, useNativeDriver: true }),
          Animated.timing(p.anim, { toValue: 0.1, duration: p.duration, useNativeDriver: true }),
        ])
      );
      loop.start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: Colors.gold,
            opacity: p.anim,
          }}
        />
      ))}
    </View>
  );
}

export default function InvitationCard({ navigation }: Props) {
  const { selectedDate } = useDateStore();
  const borderAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Card fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Pulsing gold glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(borderAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: false,
        }),
        Animated.timing(borderAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  if (!selectedDate) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No date selected.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('DateOptions')}>
            <Text style={styles.goldLink}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { option } = selectedDate;
  const dressCode = option.dressCode || 'Smart Casual';
  const dateTime = selectedDate.bookedAt
    ? new Date(selectedDate.bookedAt).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'This Weekend';

  const glowRadius = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [5, 22],
  });
  const glowOpacity = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1.0],
  });

  const handleSendText = async () => {
    await shareInvitationText(option.title, option.venues, dressCode);
  };

  const handleShare = async () => {
    await Share.share({
      title: 'You\'re Invited!',
      message:
        `💌 You're Invited!\n\n` +
        `Date Night: ${option.title}\n` +
        `Venues: ${option.venues.join(', ')}\n` +
        `Dress Code: ${dressCode}\n` +
        `📍 Surprise Location — Revealed on the night\n\n` +
        `Planned with Datefully ✨`,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StarParticles />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.cardWrapper, { opacity: fadeAnim }]}>
        {/* Animated gold glow border */}
        <Animated.View
          style={[
            styles.glowBorder,
            {
              shadowRadius: glowRadius,
              shadowOpacity: glowOpacity,
              opacity: glowOpacity,
            },
          ]}
        />

        {/* Card */}
        <View style={styles.card}>
          {/* Gold ornament */}
          <Text style={styles.ornament}>✦ ✦ ✦</Text>

          {/* You're Invited */}
          <Text style={styles.invitedText}>You're Invited</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Date title */}
          <Text style={styles.dateTitle}>{option.title}</Text>

          {/* Date & Time */}
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailText}>{dateTime}</Text>
          </View>

          {/* Dress Code */}
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>👗</Text>
            <View>
              <Text style={styles.detailLabel}>Dress Code</Text>
              <Text style={styles.detailText}>{dressCode}</Text>
            </View>
          </View>

          {/* Mystery Location */}
          <View style={styles.mysteryBox}>
            <Text style={styles.mysteryIcon}>📍</Text>
            <View>
              <Text style={styles.mysteryLabel}>Surprise Location</Text>
              <Text style={styles.mysteryText}>Revealed on the night</Text>
            </View>
          </View>

          {/* Bottom ornament */}
          <View style={styles.divider} />
          <Text style={styles.logoSmall}>Datefully</Text>
          <Text style={styles.logoTagline}>Plan. Connect. Remember.</Text>
        </View>
      </Animated.View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.textBtn} onPress={handleSendText} activeOpacity={0.85}>
          <Text style={styles.textBtnText}>💬 Send via Text</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.85}>
          <Text style={styles.shareBtnText}>Share ↗</Text>
        </TouchableOpacity>
      </View>

      {/* Confirm button */}
      <TouchableOpacity
        style={styles.confirmBtn}
        onPress={() => navigation.navigate('Confirmation')}
        activeOpacity={0.85}
      >
        <Text style={styles.confirmBtnText}>Confirm Booking →</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.md,
  },
  backBtn: { marginBottom: Spacing.sm },
  backText: { color: Colors.gold, fontSize: Typography.base },
  cardWrapper: {
    flex: 1,
    paddingHorizontal: Spacing.screen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowBorder: {
    position: 'absolute',
    width: width - Spacing.screen * 2,
    borderRadius: BorderRadius.xxl,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    top: 0,
    bottom: 0,
  },
  card: {
    width: width - Spacing.screen * 2,
    backgroundColor: '#0d0d0d',
    borderRadius: BorderRadius.xxl,
    borderWidth: 2,
    borderColor: Colors.gold,
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  ornament: {
    color: Colors.gold,
    fontSize: Typography.sm,
    letterSpacing: 8,
    opacity: 0.6,
  },
  invitedText: {
    fontFamily: Typography.heading,
    fontSize: Typography.xxxl,
    color: Colors.gold,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  divider: {
    width: 80,
    height: 1,
    backgroundColor: Colors.gold,
    opacity: 0.4,
    marginVertical: Spacing.xs,
  },
  dateTitle: {
    fontFamily: Typography.heading,
    fontSize: Typography.xl,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    alignSelf: 'stretch',
  },
  detailIcon: { fontSize: 18, marginTop: 2 },
  detailLabel: { fontSize: Typography.xs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  detailText: { color: Colors.textPrimary, fontSize: Typography.base },
  mysteryBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(201,168,76,0.07)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.2)',
  },
  mysteryIcon: { fontSize: 18 },
  mysteryLabel: { color: Colors.gold, fontSize: Typography.sm, fontWeight: Typography.semibold, marginBottom: 2 },
  mysteryText: { color: Colors.textSecondary, fontSize: Typography.sm },
  logoSmall: {
    fontFamily: Typography.heading,
    fontSize: Typography.md,
    color: Colors.gold,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  logoTagline: { color: Colors.textMuted, fontSize: Typography.xs },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screen,
    marginBottom: Spacing.sm,
  },
  textBtn: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  textBtnText: { color: Colors.textPrimary, fontSize: Typography.sm, fontWeight: Typography.semibold },
  shareBtn: {
    flex: 1,
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.gold,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  shareBtnText: { color: Colors.gold, fontSize: Typography.sm, fontWeight: Typography.semibold },
  confirmBtn: {
    marginHorizontal: Spacing.screen,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.red,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  confirmBtnText: { color: Colors.white, fontSize: Typography.base, fontWeight: Typography.bold, letterSpacing: 0.5 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  errorText: { color: Colors.textSecondary, fontSize: Typography.base },
  goldLink: { color: Colors.gold, fontSize: Typography.base, fontWeight: Typography.semibold },
});
