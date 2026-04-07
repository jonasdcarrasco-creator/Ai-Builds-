import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  black: '#000000',
  deepRed: '#C0392B',
  gold: '#C9A84C',
  white: '#FFFFFF',
  dark: '#111111',
  darkBorder: '#2A2A2A',
  textMuted: '#888888',
  green: '#27AE60',
};

interface Vendor {
  emoji: string;
  name: string;
  type: string;
  desc: string;
  rating: number;
  price: number;
  available: boolean;
}

const VENDORS: Vendor[] = [
  {
    emoji: '🌹',
    name: 'Rose Florist',
    type: 'Flowers · Philadelphia',
    desc: 'Fresh bouquets, rose petals, and floral arrangements delivered to your venue.',
    rating: 4.9,
    price: 18,
    available: true,
  },
  {
    emoji: '🍫',
    name: 'Sweet Moments',
    type: 'Chocolates · Philadelphia',
    desc: 'Handcrafted chocolate boxes and sweet treats, personalized for your date.',
    rating: 4.8,
    price: 22,
    available: true,
  },
  {
    emoji: '🐴',
    name: 'Philly Carriage Co.',
    type: 'Horse Carriage · Philadelphia',
    desc: 'Romantic horse-drawn carriage rides through historic Philadelphia streets.',
    rating: 4.9,
    price: 65,
    available: true,
  },
  {
    emoji: '📸',
    name: 'Captured Moments',
    type: 'Photography · Philadelphia',
    desc: 'Professional date night photographer captures your evening\'s best moments.',
    rating: 5.0,
    price: 49,
    available: true,
  },
  {
    emoji: '🧖',
    name: 'Glow & Romance',
    type: 'Spa Setup · Philadelphia',
    desc: 'In-home spa experience setup — candles, oils, face masks, bath bombs delivered.',
    rating: 4.7,
    price: 35,
    available: true,
  },
  {
    emoji: '🚁',
    name: 'Sky Romance Helicopters',
    type: 'Helicopter · Philadelphia',
    desc: 'Coming soon — exclusive aerial date experiences over the city.',
    rating: 0,
    price: 0,
    available: false,
  },
];

interface Props {
  navigation: any;
  route: any;
}

export default function VendorMarketplaceScreen({ navigation, route }: Props) {
  const [addedVendors, setAddedVendors] = useState<Vendor[]>([]);
  const cardAnims = useRef(VENDORS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = cardAnims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 350,
        delay: i * 80,
        useNativeDriver: true,
      })
    );
    Animated.stagger(80, animations).start();
  }, []);

  const handleAddVendor = (vendor: Vendor) => {
    if (!vendor.available) return;
    setAddedVendors(prev => {
      const alreadyAdded = prev.find(v => v.name === vendor.name);
      if (alreadyAdded) {
        return prev.filter(v => v.name !== vendor.name);
      }
      return [...prev, vendor];
    });
  };

  const isAdded = (vendor: Vendor) =>
    !!addedVendors.find(v => v.name === vendor.name);

  const total = addedVendors.reduce((sum, v) => sum + v.price, 0);

  const renderStars = (rating: number) => {
    if (rating === 0) return null;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= Math.round(rating) ? 'star' : 'star-outline'}
          size={12}
          color={i <= Math.round(rating) ? COLORS.gold : '#444'}
          style={{ marginRight: 1 }}
        />
      );
    }
    return stars;
  };

  const renderProgressDots = () => {
    return (
      <View style={styles.progressRow}>
        {Array.from({ length: 9 }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === 6 ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    );
  };

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
        <Text style={styles.heading}>Make it unforgettable</Text>
        <Text style={styles.subtext}>
          Add extras from local vendors — exclusive to Datefully
        </Text>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {VENDORS.map((vendor, index) => {
          const cardScale = cardAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1.0],
          });
          const cardOpacity = cardAnims[index];
          const added = isAdded(vendor);

          return (
            <Animated.View
              key={vendor.name}
              style={[
                styles.vendorCard,
                !vendor.available && styles.vendorCardUnavailable,
                added && styles.vendorCardAdded,
                { transform: [{ scale: cardScale }], opacity: cardOpacity },
              ]}
            >
              <View style={styles.vendorRow}>
                {/* Emoji */}
                <Text
                  style={[
                    styles.vendorEmoji,
                    !vendor.available && styles.unavailableOpacity,
                  ]}
                >
                  {vendor.emoji}
                </Text>

                {/* Content */}
                <View
                  style={[
                    styles.vendorContent,
                    !vendor.available && styles.unavailableOpacity,
                  ]}
                >
                  <Text style={styles.vendorName}>{vendor.name}</Text>
                  <Text style={styles.vendorType}>{vendor.type}</Text>
                  <Text style={styles.vendorDesc}>{vendor.desc}</Text>

                  {vendor.available && vendor.rating > 0 && (
                    <View style={styles.starsRow}>
                      {renderStars(vendor.rating)}
                      <Text style={styles.ratingText}>{vendor.rating.toFixed(1)}</Text>
                    </View>
                  )}

                  {vendor.available && (
                    <Text style={styles.priceText}>Starting from ${vendor.price}</Text>
                  )}
                </View>

                {/* Button */}
                <View style={styles.vendorActionCol}>
                  {vendor.available ? (
                    <TouchableOpacity
                      style={[
                        styles.addBtn,
                        added && styles.addedBtn,
                      ]}
                      onPress={() => handleAddVendor(vendor)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.addBtnText}>
                        {added ? '✓ Added' : 'Add'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.comingSoonBtn}>
                      <Text style={styles.comingSoonText}>Coming Soon</Text>
                    </View>
                  )}
                </View>
              </View>
            </Animated.View>
          );
        })}

        {/* Vendor Join Banner */}
        <TouchableOpacity
          style={styles.joinBanner}
          onPress={() => Alert.alert('Coming soon!')}
          activeOpacity={0.8}
        >
          <Text style={styles.joinBannerText}>
            Are you a local vendor? Join Datefully free →
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Running total bar */}
      {addedVendors.length > 0 && (
        <View style={styles.totalBar}>
          <Text style={styles.totalBarText}>Extras total: ${total}</Text>
          <TouchableOpacity
            style={styles.continueSmallBtn}
            onPress={() =>
              navigation.navigate('InvitationCard', {
                vendors: addedVendors,
                total,
              })
            }
            activeOpacity={0.8}
          >
            <Text style={styles.continueSmallBtnText}>Continue to Invitation →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Always visible continue button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() =>
            navigation.navigate('InvitationCard', {
              vendors: addedVendors,
              total,
            })
          }
          activeOpacity={0.8}
        >
          <Text style={styles.continueBtnText}>Continue to Invitation Card →</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 8,
  },
  heading: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 26,
    marginBottom: 6,
  },
  subtext: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  vendorCard: {
    backgroundColor: COLORS.dark,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  vendorCardAdded: {
    borderColor: COLORS.gold,
  },
  vendorCardUnavailable: {
    backgroundColor: '#1A1A1A',
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  vendorEmoji: {
    fontSize: 32,
    marginRight: 12,
    marginTop: 2,
  },
  unavailableOpacity: {
    opacity: 0.5,
  },
  vendorContent: {
    flex: 1,
    marginRight: 8,
  },
  vendorName: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  vendorType: {
    color: COLORS.gold,
    fontSize: 12,
    marginBottom: 4,
  },
  vendorDesc: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  ratingText: {
    color: COLORS.white,
    fontSize: 12,
    marginLeft: 4,
  },
  priceText: {
    color: COLORS.white,
    fontSize: 13,
    marginTop: 2,
  },
  vendorActionCol: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 4,
  },
  addBtn: {
    backgroundColor: COLORS.deepRed,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  addedBtn: {
    backgroundColor: COLORS.green,
  },
  addBtnText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 13,
  },
  comingSoonBtn: {
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  comingSoonText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  joinBanner: {
    backgroundColor: COLORS.dark,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  joinBannerText: {
    color: COLORS.gold,
    fontSize: 13,
    textAlign: 'center',
  },
  totalBar: {
    backgroundColor: COLORS.dark,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  totalBarText: {
    color: COLORS.gold,
    fontWeight: 'bold',
    fontSize: 15,
  },
  continueSmallBtn: {
    backgroundColor: COLORS.deepRed,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  continueSmallBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.black,
  },
  continueBtn: {
    backgroundColor: COLORS.deepRed,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
