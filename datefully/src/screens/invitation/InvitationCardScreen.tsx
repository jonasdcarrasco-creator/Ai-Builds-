import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  black: '#000000',
  deepRed: '#C0392B',
  gold: '#C9A84C',
  white: '#FFFFFF',
  dark: '#111111',
  darkBorder: '#2A2A2A',
  textMuted: '#888888',
};

interface Props {
  navigation: any;
  route: any;
}

export default function InvitationCardScreen({ navigation, route }: Props) {
  const vendors = route?.params?.vendors ?? [];

  // Card slide-up + fade-in
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  // Border glow pulse
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  // Sent confirmation overlay
  const [sentVisible, setSentVisible] = useState(false);
  const sentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Card reveal
    Animated.parallel([
      Animated.timing(cardSlide, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous glow pulse
    const pulse = () => {
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1.0,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) pulse();
      });
    };
    pulse();
  }, []);

  const handleSend = () => {
    setSentVisible(true);
    Animated.timing(sentOpacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(sentOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setSentVisible(false);
          navigation.navigate('Confirmation', {
            vendors,
          });
        });
      }, 1500);
    });
  };

  const renderProgressDots = () => (
    <View style={styles.progressRow}>
      {Array.from({ length: 9 }, (_, i) => (
        <View
          key={i}
          style={[styles.dot, i === 7 ? styles.dotActive : styles.dotInactive]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        {renderProgressDots()}
        <View style={styles.backBtn} />
      </View>

      {/* Title */}
      <View style={styles.titleSection}>
        <Text style={styles.heading}>Send the invitation card</Text>
        <Text style={styles.subtext}>
          Surprise your date before the night even starts
        </Text>
      </View>

      {/* Invitation card */}
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            transform: [{ translateY: cardSlide }],
            opacity: cardOpacity,
          },
        ]}
      >
        <Animated.View style={[styles.card, { opacity: glowAnim }]}>
          {/* This is a transparent overlay to produce glow — actual card below */}
        </Animated.View>

        <View style={styles.cardInner}>
          {/* Top gold gradient line */}
          <LinearGradient
            colors={['transparent', COLORS.gold, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientLine}
          />

          <Text style={styles.invitedLabel}>YOU HAVE BEEN INVITED</Text>

          {/* Logo row */}
          <View style={styles.logoRow}>
            <Ionicons name="calendar" size={28} color={COLORS.deepRed} />
            <Text style={styles.logoDate}>Date</Text>
            <Text style={styles.logoFully}>fully</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          <Text style={styles.dateText}>Saturday, March 28th · 7:00 PM</Text>
          <Text style={styles.dressText}>Dress to impress</Text>
          <Text style={styles.locationText}>Location is a surprise ✨</Text>

          {vendors.length > 0 && (
            <Text style={styles.specialText}>Something special is waiting... 🎁</Text>
          )}

          {/* Bottom gold gradient line */}
          <LinearGradient
            colors={['transparent', COLORS.gold, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradientLine, { marginTop: 20, marginBottom: 0 }]}
          />
        </View>
      </Animated.View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Bottom note */}
      <Text style={styles.bottomNote}>
        Every card shared = free marketing for Datefully
      </Text>

      {/* Skip */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Confirmation', { vendors })}
        style={styles.skipBtn}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>Skip →</Text>
      </TouchableOpacity>

      {/* Send button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={handleSend}
          activeOpacity={0.85}
        >
          <Text style={styles.sendBtnText}>Text to my date 💌</Text>
        </TouchableOpacity>
      </View>

      {/* Sent confirmation overlay */}
      {sentVisible && (
        <Animated.View style={[styles.sentOverlay, { opacity: sentOpacity }]}>
          <View style={styles.sentCard}>
            <Text style={styles.sentText}>✓ Sent!</Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: COLORS.deepRed,
    width: 20,
    borderRadius: 4,
  },
  dotInactive: {
    backgroundColor: COLORS.darkBorder,
  },
  titleSection: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  heading: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 6,
  },
  subtext: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  cardWrapper: {
    marginHorizontal: 24,
    position: 'relative',
  },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
  },
  cardInner: {
    backgroundColor: '#0D0D0D',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    padding: 28,
    alignItems: 'center',
  },
  gradientLine: {
    width: '100%',
    height: 2,
    marginBottom: 20,
  },
  invitedLabel: {
    color: COLORS.gold,
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoDate: {
    color: COLORS.gold,
    fontWeight: 'bold',
    fontSize: 22,
    marginLeft: 8,
  },
  logoFully: {
    color: COLORS.white,
    fontSize: 22,
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.gold,
    marginBottom: 16,
  },
  dateText: {
    color: COLORS.white,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 10,
  },
  dressText: {
    color: COLORS.gold,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
  },
  locationText: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  specialText: {
    color: COLORS.deepRed,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    paddingTop: 8,
  },
  sendBtn: {
    backgroundColor: COLORS.deepRed,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
  },
  sendBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipText: {
    color: '#555555',
    fontSize: 14,
  },
  bottomNote: {
    color: '#333333',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 6,
    paddingHorizontal: 24,
  },
  sentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sentCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    paddingHorizontal: 40,
    paddingVertical: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  sentText: {
    color: COLORS.gold,
    fontWeight: 'bold',
    fontSize: 22,
  },
});
