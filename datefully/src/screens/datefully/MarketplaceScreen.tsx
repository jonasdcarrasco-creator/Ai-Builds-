import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DatefullyStackParamList } from '../../navigation/DatefullyNavigator';
import { useDatefullyStore } from '../../stores/datefullyStore';

const GOLD = '#c9a84c';
const RED = '#c0392b';
const GREEN = '#27ae60';

type Nav = NativeStackNavigationProp<DatefullyStackParamList, 'Marketplace'>;

interface Vendor {
  emoji: string;
  name: string;
  city: string;
  desc: string;
  rating: string;
  price: string;
  priceNum: number;
  comingSoon?: boolean;
}

const VENDORS: Vendor[] = [
  { emoji: '🌹', name: 'Petal & Rose Florist', city: 'Philadelphia, PA', desc: 'Fresh roses, bouquets & custom arrangements delivered same day.', rating: '4.9', price: 'From $18', priceNum: 18 },
  { emoji: '🍫', name: 'Sweet Moments', city: 'Philadelphia, PA', desc: 'Artisan chocolates, truffles & romantic gift boxes.', rating: '4.8', price: 'From $22', priceNum: 22 },
  { emoji: '🐎', name: 'Philly Carriage Co.', city: 'Philadelphia, PA', desc: 'Classic horse-drawn carriage rides through the city.', rating: '4.7', price: 'From $65', priceNum: 65 },
  { emoji: '📷', name: 'Captured Moments', city: 'Philadelphia, PA', desc: 'Professional date night photography — candid & portrait.', rating: '4.9', price: 'From $49', priceNum: 49 },
  { emoji: '💆', name: 'Glow & Romance', city: 'Philadelphia, PA', desc: 'In-home spa setup, rose petals, candles & aromatherapy.', rating: '4.8', price: 'From $35', priceNum: 35 },
  { emoji: '🚁', name: 'Sky Romance Helicopters', city: 'Philadelphia, PA', desc: 'Rooftop helicopter date experiences.', rating: '—', price: 'Coming Soon', priceNum: 0, comingSoon: true },
];

const NavDots = ({ total, current }: { total: number; current: number }) => (
  <View style={styles.dots}>
    {Array.from({ length: total }).map((_, i) => (
      <View key={i} style={[styles.dot, { width: i === current ? 16 : 6, backgroundColor: i === current ? RED : '#333' }]} />
    ))}
  </View>
);

export default function MarketplaceScreen() {
  const navigation = useNavigation<Nav>();
  const { selectedVendors, vendorTotal, toggleVendor } = useDatefullyStore();

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>
          Make it{' '}
          <Text style={{ color: GOLD }}>Unforgettable</Text>
        </Text>

        {vendorTotal > 0 && (
          <View style={styles.totalBar}>
            <Text style={styles.totalText}>✦ Total Added: </Text>
            <Text style={[styles.totalText, { color: GOLD, fontWeight: '700' }]}>${vendorTotal}</Text>
          </View>
        )}

        {VENDORS.map((v) => {
          const isAdded = selectedVendors.includes(v.name);
          return (
            <View
              key={v.name}
              style={[
                styles.card,
                v.comingSoon && styles.cardDisabled,
                isAdded && styles.cardAdded,
              ]}
            >
              <View style={styles.cardTop}>
                <Text style={styles.cardEmoji}>{v.emoji}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.cardName, v.comingSoon && { color: '#555' }]}>{v.name}</Text>
                  <Text style={[styles.cardCity, v.comingSoon && { color: '#444' }]}>{v.city}</Text>
                </View>
                <View style={styles.ratingBox}>
                  <Text style={[styles.ratingText, v.comingSoon && { color: '#444' }]}>⭐ {v.rating}</Text>
                </View>
              </View>
              <Text style={[styles.cardDesc, v.comingSoon && { color: '#444' }]}>{v.desc}</Text>
              <View style={styles.cardFooter}>
                <Text style={[styles.priceText, v.comingSoon && { color: '#444' }]}>{v.price}</Text>
                {v.comingSoon ? (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Coming Soon</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.addBtn, isAdded && styles.addBtnAdded]}
                    onPress={() => toggleVendor(v.name, v.priceNum)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.addBtnText, isAdded && { color: GREEN }]}>
                      {isAdded ? '✓ Added' : '+ Add'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

        {/* vendor banner */}
        <View style={styles.vendorBanner}>
          <Text style={styles.vendorBannerText}>
            Are you a local vendor?{' '}
            <Text style={{ color: GOLD, fontWeight: '700' }}>Join Datefully →</Text>
          </Text>
        </View>

        <View style={{ height: 10 }} />
      </ScrollView>

      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => navigation.navigate('InvitationCard')}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>Continue to Invitation →</Text>
        </TouchableOpacity>
        <NavDots total={9} current={6} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  back: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  backText: { color: '#fff', fontSize: 17 },
  scroll: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 10 },
  heading: { color: '#fff', fontSize: 28, fontWeight: '700', marginBottom: 16 },
  totalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1200',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GOLD,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
  },
  totalText: { color: '#fff', fontSize: 15 },
  card: {
    backgroundColor: '#0a0a0a',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#222',
    padding: 16,
    marginBottom: 12,
  },
  cardDisabled: { opacity: 0.45 },
  cardAdded: { borderColor: GREEN },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardEmoji: { fontSize: 28 },
  cardName: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cardCity: { color: '#888', fontSize: 12, marginTop: 2 },
  ratingBox: {},
  ratingText: { color: GOLD, fontSize: 13 },
  cardDesc: { color: '#aaa', fontSize: 13, lineHeight: 19, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceText: { color: GOLD, fontSize: 14, fontWeight: '700' },
  addBtn: {
    backgroundColor: '#1a0000',
    borderWidth: 1.5,
    borderColor: RED,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  addBtnAdded: { borderColor: GREEN, backgroundColor: '#001a00' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  comingSoonBadge: { backgroundColor: '#111', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  comingSoonText: { color: '#555', fontSize: 12 },
  vendorBanner: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  vendorBannerText: { color: '#888', fontSize: 14, textAlign: 'center' },
  bottomArea: { paddingHorizontal: 20, paddingTop: 8 },
  continueBtn: {
    backgroundColor: RED,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  continueBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingBottom: 16 },
  dot: { height: 6, borderRadius: 3 },
});
