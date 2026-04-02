import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, VendorListing } from '../types';
import { useDateStore } from '../store';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'VendorMarketplace'>;
};

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return (
    <View style={{ flexDirection: 'row', gap: 2, alignItems: 'center' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Text key={i} style={{ fontSize: 12, color: i < fullStars ? Colors.gold : Colors.cardBorder }}>
          {i < fullStars ? '★' : i === fullStars && hasHalf ? '½' : '☆'}
        </Text>
      ))}
      <Text style={{ color: Colors.textSecondary, fontSize: Typography.sm, marginLeft: 4 }}>
        {rating.toFixed(1)}
      </Text>
    </View>
  );
}

function VendorCard({ vendor, onBook }: { vendor: VendorListing; onBook: () => void }) {
  return (
    <View style={styles.card}>
      {/* Sponsored tag */}
      {vendor.sponsored && (
        <View style={styles.sponsoredBadge}>
          <Text style={styles.sponsoredText}>Sponsored</Text>
        </View>
      )}

      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.vendorName}>{vendor.name}</Text>
          <Text style={styles.vendorCategory}>{vendor.category}</Text>
        </View>
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>{vendor.priceRange}</Text>
        </View>
      </View>

      <StarRating rating={vendor.rating} />

      <Text style={styles.vendorDescription}>{vendor.description}</Text>

      <TouchableOpacity style={styles.bookBtn} onPress={onBook} activeOpacity={0.85}>
        <Text style={styles.bookBtnText}>Book Now</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function VendorMarketplace({ navigation }: Props) {
  const { vendorListings } = useDateStore();

  const handleBook = async (vendor: VendorListing) => {
    try {
      await Linking.openURL(vendor.bookingUrl);
    } catch {
      // ignore
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Date-Night Partners</Text>
        <Text style={styles.subtitle}>Trusted local vendors in Philadelphia</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {vendorListings.map((vendor) => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            onBook={() => handleBook(vendor)}
          />
        ))}
        <View style={styles.bottomNote}>
          <Text style={styles.bottomNoteText}>
            All vendors are vetted partners of Datefully in Philadelphia, PA.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  backBtn: { marginBottom: Spacing.md },
  backText: { color: Colors.gold, fontSize: Typography.base },
  title: {
    fontFamily: Typography.heading,
    fontSize: Typography.xxl,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: { fontSize: Typography.sm, color: Colors.textSecondary },
  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.screen,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    position: 'relative',
  },
  sponsoredBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)',
  },
  sponsoredText: {
    color: Colors.gold,
    fontSize: 9,
    fontWeight: Typography.semibold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  cardInfo: { flex: 1 },
  vendorName: {
    fontFamily: Typography.heading,
    fontSize: Typography.lg,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  vendorCategory: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  priceTag: {
    backgroundColor: Colors.cardAlt,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  priceText: {
    color: Colors.gold,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
  },
  vendorDescription: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    lineHeight: 20,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  bookBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.gold,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  bookBtnText: {
    color: Colors.gold,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  bottomNote: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  bottomNoteText: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    textAlign: 'center',
  },
});
