import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { useAuthStore, useAppStore } from '../../store';
import { MOCK_DATE_IDEAS } from '../../constants/mockData';

interface ProfileScreenProps {
  navigation: any;
}

type ProfileTab = 'saved' | 'memories';

const REL_ICONS: Record<string, string> = {
  single: '🦋',
  dating: '💑',
  married: '💍',
  friends: '👫',
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const { savedIdeas, plans, reservations, toggleSaveIdea } = useAppStore();

  const [activeTab, setActiveTab] = useState<ProfileTab>('saved');
  const [notifs, setNotifs] = useState(user?.preferences.notificationsEnabled ?? true);
  const [saveHistory, setSaveHistory] = useState(user?.preferences.saveHistory ?? true);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'ME';

  const savedDateIdeas = MOCK_DATE_IDEAS.filter((d) => savedIdeas.includes(d.id));
  const completedDates = plans.filter((p) => p.status === 'completed').length;

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const SETTINGS_SECTIONS = [
    {
      title: 'Preferences',
      items: [
        {
          icon: 'notifications-outline',
          label: 'Push Notifications',
          toggle: true,
          value: notifs,
          onChange: setNotifs,
        },
        {
          icon: 'time-outline',
          label: 'Save Date History',
          toggle: true,
          value: saveHistory,
          onChange: setSaveHistory,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: 'location-outline', label: 'Location Services', chevron: true },
        { icon: 'pencil-outline', label: 'Edit Profile', chevron: true },
        { icon: 'shield-outline', label: 'Privacy & Security', chevron: true },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle-outline', label: 'Help & Support', chevron: true },
        { icon: 'star-outline', label: 'Rate Datefully', chevron: true },
      ],
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Hero Header */}
        <LinearGradient
          colors={['#0A0A0A', '#2D0000', '#0A0A0A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {/* Avatar */}
          <LinearGradient
            colors={['#8B0000', '#D4AF37']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>

          <Text style={styles.userName}>{user?.name ?? 'Your Name'}</Text>
          <Text style={styles.userEmail}>{user?.email ?? 'your@email.com'}</Text>

          {/* Relationship badge */}
          {user?.relationshipType && (
            <View style={styles.relBadge}>
              <Text style={styles.relEmoji}>{REL_ICONS[user.relationshipType]}</Text>
              <Text style={styles.relText}>
                {user.relationshipType.charAt(0).toUpperCase() + user.relationshipType.slice(1)}
                {user.partnerName ? ` · ${user.partnerName}` : ''}
              </Text>
            </View>
          )}

          {user?.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
              <Text style={styles.locationText}>{user.location}</Text>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{savedIdeas.length}</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{plans.length}</Text>
              <Text style={styles.statLabel}>Plans</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{reservations.length}</Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{completedDates}</Text>
              <Text style={styles.statLabel}>Dates</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Partner card */}
        {user?.partnerName && (
          <View style={styles.partnerCard}>
            <View style={styles.partnerLeft}>
              <LinearGradient
                colors={['#8B0000', '#D4AF37']}
                style={styles.partnerAvatar}
              >
                <Text style={styles.partnerAvatarText}>
                  {user.partnerName[0].toUpperCase()}
                </Text>
              </LinearGradient>
              <View>
                <Text style={styles.partnerName}>{user.partnerName}</Text>
                <Text style={styles.partnerSub}>Your partner</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.inviteBtn}>
              <Text style={styles.inviteBtnText}>Invite</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsWrap}>
          <View style={styles.tabs}>
            {(['saved', 'memories'] as ProfileTab[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]}
                onPress={() => setActiveTab(t)}
              >
                <Ionicons
                  name={t === 'saved' ? (activeTab === t ? 'heart' : 'heart-outline') : (activeTab === t ? 'images' : 'images-outline')}
                  size={16}
                  color={activeTab === t ? Colors.primary : Colors.textMuted}
                />
                <Text style={[styles.tabLabel, activeTab === t && styles.tabLabelActive]}>
                  {t === 'saved' ? `Saved (${savedIdeas.length})` : 'Memories'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {activeTab === 'saved' ? (
          <View style={styles.savedSection}>
            {savedDateIdeas.length === 0 ? (
              <View style={styles.emptyTab}>
                <Text style={styles.emptyTabEmoji}>❤️</Text>
                <Text style={styles.emptyTabTitle}>Nothing Saved Yet</Text>
                <Text style={styles.emptyTabSub}>
                  Tap the heart on any date idea to save it here
                </Text>
                <TouchableOpacity
                  style={styles.exploreBtn}
                  onPress={() => navigation.navigate('Explore')}
                >
                  <Text style={styles.exploreBtnText}>Explore Ideas</Text>
                </TouchableOpacity>
              </View>
            ) : (
              savedDateIdeas.map((idea) => (
                <TouchableOpacity
                  key={idea.id}
                  style={styles.savedCard}
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('DateIdeaDetail', { idea })}
                >
                  <Image source={{ uri: idea.imageUrl }} style={styles.savedImg} />
                  <View style={styles.savedInfo}>
                    <Text style={styles.savedTitle} numberOfLines={2}>{idea.title}</Text>
                    <View style={styles.savedMeta}>
                      <Ionicons name="star" size={11} color={Colors.primary} />
                      <Text style={styles.savedRating}>{idea.rating}</Text>
                      <Text style={styles.savedDot}>·</Text>
                      <Text style={styles.savedPrice}>{idea.priceRange}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.unsaveBtn}
                    onPress={() => toggleSaveIdea(idea.id)}
                  >
                    <Ionicons name="heart" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          <View style={styles.memoriesSection}>
            <View style={styles.emptyTab}>
              <Text style={styles.emptyTabEmoji}>📸</Text>
              <Text style={styles.emptyTabTitle}>No Memories Yet</Text>
              <Text style={styles.emptyTabSub}>
                Complete date plans and add photos to start your memory gallery
              </Text>
              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => navigation.navigate('Plan')}
              >
                <Text style={styles.exploreBtnText}>Start a Plan</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Settings */}
        <View style={styles.settingsSection}>
          {SETTINGS_SECTIONS.map((section) => (
            <View key={section.title} style={styles.settingsGroup}>
              <Text style={styles.settingsGroupTitle}>{section.title}</Text>
              <View style={styles.settingsCard}>
                {section.items.map((item: any, idx) => (
                  <View
                    key={item.label}
                    style={[
                      styles.settingsRow,
                      idx < section.items.length - 1 && styles.settingsRowBorder,
                    ]}
                  >
                    <View style={styles.settingsLeft}>
                      <View style={styles.settingsIconWrap}>
                        <Ionicons name={item.icon as any} size={18} color={Colors.primary} />
                      </View>
                      <Text style={styles.settingsLabel}>{item.label}</Text>
                    </View>
                    {item.toggle ? (
                      <Switch
                        value={item.value}
                        onValueChange={item.onChange}
                        trackColor={{ false: Colors.inputBorder, true: Colors.secondary }}
                        thumbColor={item.value ? Colors.primary : Colors.gray400}
                      />
                    ) : (
                      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Sign Out */}
          <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color={Colors.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.version}>Datefully v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['2xl'],
    paddingHorizontal: Spacing['2xl'],
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 88, height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  userName: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  userEmail: { fontSize: 14, color: Colors.textMuted },
  relBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(139,0,0,0.2)',
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(139,0,0,0.4)',
  },
  relEmoji: { fontSize: 15 },
  relText: { fontSize: 13, fontWeight: '600', color: '#FF8080' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 13, color: Colors.textMuted },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    marginTop: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  statDivider: { width: 1, backgroundColor: Colors.inputBorder, marginVertical: 4 },
  partnerCard: {
    marginHorizontal: Spacing['2xl'],
    marginTop: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  partnerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  partnerAvatar: {
    width: 44, height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerAvatarText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  partnerName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  partnerSub: { fontSize: 12, color: Colors.textMuted },
  inviteBtn: {
    paddingHorizontal: 18, paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.secondary,
  },
  inviteBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  tabsWrap: { marginTop: Spacing.xl, paddingHorizontal: Spacing['2xl'] },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.xl,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
  },
  tabBtnActive: { backgroundColor: 'rgba(212,175,55,0.12)' },
  tabLabel: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  tabLabelActive: { color: Colors.primary },
  savedSection: { paddingHorizontal: Spacing['2xl'], paddingTop: Spacing.xl },
  savedCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
  },
  savedImg: { width: 80, height: 80 },
  savedInfo: { flex: 1, padding: 12, gap: 6 },
  savedTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, lineHeight: 19 },
  savedMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  savedRating: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  savedDot: { color: Colors.textMuted, fontSize: 12 },
  savedPrice: { fontSize: 12, color: Colors.textMuted },
  unsaveBtn: { padding: 14 },
  memoriesSection: { paddingHorizontal: Spacing['2xl'], paddingTop: Spacing.xl },
  emptyTab: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyTabEmoji: { fontSize: 48 },
  emptyTabTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  emptyTabSub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  exploreBtn: {
    marginTop: 8,
    paddingHorizontal: 24, paddingVertical: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.secondary,
  },
  exploreBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  settingsSection: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['2xl'],
    gap: Spacing.xl,
  },
  settingsGroup: { gap: 8 },
  settingsGroupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingLeft: 4,
  },
  settingsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.base,
  },
  settingsRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.inputBorder },
  settingsLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingsIconWrap: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsLabel: { fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(231,76,60,0.08)',
    borderRadius: BorderRadius.xl,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(231,76,60,0.2)',
  },
  signOutText: { fontSize: 15, fontWeight: '700', color: Colors.error },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textMuted,
    paddingBottom: 8,
  },
});
