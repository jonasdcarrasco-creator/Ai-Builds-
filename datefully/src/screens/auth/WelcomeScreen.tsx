import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { Button } from '../../components/common/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Plan the\nPerfect Date',
    subtitle: 'Discover curated date ideas for every mood, budget, and occasion.',
    gradient: ['#FF6B9D', '#C0392B'] as [string, string],
    emoji: '💕',
    bg: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=800',
  },
  {
    id: '2',
    title: 'Reserve\nYour Spot',
    subtitle: 'Real-time restaurant reservations at the best venues, all in one place.',
    gradient: ['#9B59B6', '#6C3483'] as [string, string],
    emoji: '🍷',
    bg: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
  },
  {
    id: '3',
    title: 'Make\nMemories',
    subtitle: 'Capture and relive your best moments together. Your love story, beautifully organized.',
    gradient: ['#F39C12', '#E74C3C'] as [string, string],
    emoji: '✨',
    bg: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',
  },
];

interface WelcomeScreenProps {
  navigation: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
      setActiveIndex(activeIndex + 1);
    } else {
      navigation.navigate('Signup');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setActiveIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image
              source={{ uri: item.bg }}
              style={styles.slideImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)', '#000']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.slideContent}>
              <Text style={styles.slideEmoji}>{item.emoji}</Text>
              <Text style={styles.slideTitle}>{item.title}</Text>
              <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + Spacing.xl }]}>
        {/* Logo */}
        <View style={styles.logoRow}>
          <LinearGradient
            colors={['#FF6B9D', '#E85585']}
            style={styles.logoIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="heart" size={18} color={Colors.white} />
          </LinearGradient>
          <Text style={styles.logoText}>datefully</Text>
        </View>

        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, index) => {
            const inputRange = [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 1, 0.4],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={index}
                style={[styles.dot, { width: dotWidth, opacity }]}
              />
            );
          })}
        </View>

        <Button
          title={activeIndex === SLIDES.length - 1 ? "Let's Begin 💕" : 'Continue'}
          onPress={handleNext}
          size="xl"
        />

        <TouchableOpacity onPress={handleSkip} style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Text style={styles.loginLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  slideImage: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  slideContent: {
    position: 'absolute',
    bottom: 280,
    left: Spacing['2xl'],
    right: Spacing['2xl'],
    gap: 12,
  },
  slideEmoji: {
    fontSize: 48,
  },
  slideTitle: {
    fontSize: 44,
    fontWeight: '900',
    color: Colors.white,
    lineHeight: 50,
    letterSpacing: -1.5,
  },
  slideSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 24,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: Spacing['2xl'],
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.xl,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});
