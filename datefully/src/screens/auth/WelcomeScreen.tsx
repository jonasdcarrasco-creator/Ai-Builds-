import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W, height: H } = Dimensions.get('window');

const GOLD = '#C9A84C';
const RED = '#C0392B';
const DARK_BG = '#0A0A0A';
const PILL_BG = '#1A1A1A';
const BORDER = '#2A2A2A';

interface Slide {
  id: string;
  icon: string; // Ionicons name
  iconColor: string;
  tagline: string;
  title1: string;
  title2: string;
  subtitle: string;
  pill?: string;
  ctaLabel: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    icon: 'calendar',
    iconColor: RED,
    tagline: '',
    title1: 'Date',
    title2: 'fully',
    subtitle: 'THE ONLY APP THAT PLANS YOUR ENTIRE DATE — FROM BUDGET TO TRANSPORTATION — SO YOU CAN FOCUS ON THE MOMENT.',
    pill: 'Philadelphia, PA detected',
    ctaLabel: 'Get Started — It\'s Free',
  },
  {
    id: '2',
    icon: 'map',
    iconColor: GOLD,
    tagline: 'STEP 1',
    title1: 'Smart',
    title2: ' Planning',
    subtitle: 'TELL US YOUR VIBE, BUDGET, AND LOCATION. WE HANDLE THE REST — EVERY DETAIL MAPPED OUT.',
    ctaLabel: 'Sounds Good',
  },
  {
    id: '3',
    icon: 'cash-outline',
    iconColor: '#27AE60',
    tagline: 'STEP 2',
    title1: 'Budget',
    title2: ' Tracker',
    subtitle: 'SET YOUR SPENDING LIMIT AND WE\'LL BUILD A FULL DATE NIGHT WITHIN IT. NO SURPRISES.',
    ctaLabel: 'Love That',
  },
  {
    id: '4',
    icon: 'car-outline',
    iconColor: '#3498DB',
    tagline: 'STEP 3',
    title1: 'Door-to-',
    title2: 'Door',
    subtitle: 'RIDESHARE, PARKING, WALKING ROUTES — WE FIGURE OUT HOW YOU\'LL GET THERE AND BACK.',
    ctaLabel: 'That\'s Helpful',
  },
  {
    id: '5',
    icon: 'restaurant-outline',
    iconColor: '#E67E22',
    tagline: 'STEP 4',
    title1: 'Real',
    title2: ' Reservations',
    subtitle: 'BOOK THE BEST TABLES AT TOP RESTAURANTS RIGHT FROM THE APP. NO CALLS, NO WAITING.',
    ctaLabel: 'Book It',
  },
  {
    id: '6',
    icon: 'camera-outline',
    iconColor: '#9B59B6',
    tagline: 'STEP 5',
    title1: 'Capture',
    title2: ' Memories',
    subtitle: 'SAVE YOUR FAVORITE MOMENTS TOGETHER. EVERY DATE BECOMES PART OF YOUR LOVE STORY.',
    ctaLabel: 'Aww, Yes',
  },
  {
    id: '7',
    icon: 'heart-outline',
    iconColor: RED,
    tagline: 'STEP 6',
    title1: 'Built',
    title2: ' For You',
    subtitle: 'THE MORE DATES YOU GO ON, THE SMARTER IT GETS. PERSONALIZED PICKS EVERY TIME.',
    ctaLabel: 'I\'m In',
  },
  {
    id: '8',
    icon: 'notifications-outline',
    iconColor: GOLD,
    tagline: 'STEP 7',
    title1: 'Never',
    title2: ' Miss A Beat',
    subtitle: 'GET REMINDERS, CONFIRMATIONS, AND LAST-MINUTE IDEAS — ALL AT THE RIGHT TIME.',
    ctaLabel: 'Keep Me Posted',
  },
  {
    id: '9',
    icon: 'star-outline',
    iconColor: GOLD,
    tagline: 'READY',
    title1: 'Plan Your',
    title2: ' First Date',
    subtitle: 'JOIN THOUSANDS OF COUPLES WHO STOPPED STRESSING AND STARTED DATING SMARTER.',
    ctaLabel: 'Create My Account',
  },
];

interface Props {
  navigation: any;
}

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      const next = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveIndex(next);
    } else {
      navigation.navigate('Signup');
    }
  };

  const handleBack = () => {
    if (activeIndex > 0) {
      const prev = activeIndex - 1;
      flatListRef.current?.scrollToIndex({ index: prev, animated: true });
      setActiveIndex(prev);
    }
  };

  const slide = SLIDES[activeIndex];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header label */}
      <Text style={styles.headerLabel}>
        SCREEN {activeIndex + 1} OF {SLIDES.length} — {activeIndex === 0 ? 'SPLASH' : `STEP ${activeIndex}`}
      </Text>

      {/* Swipeable screens */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        renderItem={({ item }) => (
          <View style={styles.slideContainer}>
            {/* Phone frame */}
            <View style={styles.phoneFrame}>
              <View style={styles.phoneInner}>
                {/* Icon */}
                <View style={styles.iconWrapper}>
                  <View style={[styles.iconBox, { borderColor: item.iconColor }]}>
                    <Ionicons name={item.icon as any} size={48} color={item.iconColor} />
                    {item.id === '1' && (
                      <View style={styles.heartBadge}>
                        <Ionicons name="heart" size={14} color={GOLD} />
                      </View>
                    )}
                  </View>
                </View>

                {/* Title */}
                <View style={styles.titleRow}>
                  <Text style={styles.titleGold}>{item.title1}</Text>
                  <Text style={styles.titleWhite}>{item.title2}</Text>
                </View>

                {/* Subtitle */}
                <Text style={styles.subtitle}>{item.subtitle}</Text>

                {/* Location pill (splash only) */}
                {item.pill && (
                  <View style={styles.pill}>
                    <View style={styles.pillDot} />
                    <Text style={styles.pillText}>{item.pill}</Text>
                  </View>
                )}

                {/* CTA Button */}
                <TouchableOpacity style={styles.ctaButton} onPress={handleNext} activeOpacity={0.85}>
                  <Text style={styles.ctaText}>{item.ctaLabel}</Text>
                </TouchableOpacity>

                {/* Sign in link */}
                <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.signinRow}>
                  <Text style={styles.signinText}>Already have an account? </Text>
                  <Text style={styles.signinLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => {
          const inputRange = [(i - 1) * W, i * W, (i + 1) * W];
          const dotW = scrollX.interpolate({
            inputRange,
            outputRange: [6, 20, 6],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.35, 1, 0.35],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  width: dotW,
                  opacity,
                  backgroundColor: i === activeIndex ? GOLD : '#444',
                },
              ]}
            />
          );
        })}
      </View>

      {/* Back / Next buttons */}
      <View style={[styles.navRow, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.navBtn, activeIndex === 0 && styles.navBtnDisabled]}
          onPress={handleBack}
          disabled={activeIndex === 0}
        >
          <Text style={[styles.navBtnText, activeIndex === 0 && { opacity: 0.3 }]}>← Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navBtn, styles.navBtnActive]} onPress={handleNext}>
          <Text style={[styles.navBtnText, { color: '#fff' }]}>
            {activeIndex === SLIDES.length - 1 ? 'Finish' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tap hint */}
      {activeIndex === 0 && (
        <Text style={styles.tapHint}>Tap Next to continue</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DARK_BG,
    alignItems: 'center',
  },
  headerLabel: {
    color: '#555',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 8,
  },
  slideContainer: {
    width: W,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  phoneFrame: {
    width: W * 0.78,
    minHeight: H * 0.62,
    backgroundColor: '#111',
    borderRadius: 36,
    borderWidth: 1.5,
    borderColor: GOLD + '55',
    overflow: 'hidden',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  phoneInner: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 32,
    gap: 16,
  },
  iconWrapper: {
    marginBottom: 8,
  },
  iconBox: {
    width: 88,
    height: 88,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 24,
    height: 24,
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GOLD + '88',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  titleGold: {
    fontSize: 34,
    fontWeight: '900',
    color: GOLD,
    letterSpacing: -0.5,
  },
  titleWhite: {
    fontSize: 34,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 9.5,
    color: '#888',
    textAlign: 'center',
    letterSpacing: 1.2,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PILL_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 8,
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RED,
  },
  pillText: {
    color: '#CCC',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  ctaButton: {
    width: '100%',
    backgroundColor: RED,
    borderRadius: 28,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  signinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signinText: {
    color: '#666',
    fontSize: 12,
  },
  signinLink: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 16,
    marginBottom: 12,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
  },
  navBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  navBtnDisabled: {
    borderColor: '#222',
  },
  navBtnActive: {
    backgroundColor: '#222',
    borderColor: '#444',
  },
  navBtnText: {
    color: '#CCC',
    fontSize: 14,
    fontWeight: '600',
  },
  tapHint: {
    color: '#444',
    fontSize: 11,
    letterSpacing: 0.5,
    marginTop: 4,
    marginBottom: 8,
  },
});
