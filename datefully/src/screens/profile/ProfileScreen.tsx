import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Shadow } from '../../constants';
import { useAuthStore, useAppStore } from '../../store';
import { MOCK_DATE_IDEAS } from '../../constants/mockData';
import { DateIdeaCard } from '../../components/cards/DateIdeaCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const { savedIdeas, plans, reservations } = useAppStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);
  const [activeTab, setActiveTab] = useState<'saved' | 'memories'>('saved');

  const savedIdeaObjects = MOCK_DATE_IDEAS.filter((idea) => savedIdeas.includes(idea.id));
  const completedPlans = plans.filter((p) => p.status === 'completed').length;

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const getRelationshipLabel = (type: string) => {
    const map: Record<string, string> = {
      single: '🦋 Flying Solo',
      dating: '💑 Dating',
      married: '💍 Married',
      friends: '👫 Friends',
    };
    return map[type] || type;
  };

  const stats = [
    { label: 'Saved', value: savedIdeas.length, icon: 'heart', color: Colors.primary },
    { label: 'Plans', value: plans.length, icon: 'calendar', color: Colors.info },
    { label: 'Bookings', value: reservations.length, icon: 'restaurant', color: Colors.secondary },
    { label: 'Dates', value: completedPlans, icon: 'star', color: Colors.accent },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero Profile Header */}
        <LinearGradient
          colors={['#9B59B6', '#FF6B9D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + Spacing.base }]}
        >
          <View style={styles.heroTop}>
            <TouchableOpacity>
              <Ionicons name="settings-outline" size={22} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.2)']}
              style={styles.avatar}
            >
              <Text style={styles.avatarInitials}>
                {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </Text>
            </LinearGradient>
            <TouchableOpacity style={styles.avatarEdit}>
              <Ionicons name="camera" size={14} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.heroName}>{user?.name}</Text>
          <Text style={styles.heroEmail}>{user?.email}</Text>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{getRelationshipLabel(user?.relationshipType || '')}</Text>
          </View>
          {user?.location && (
            <View style={styles.heroLocation}>
              <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={styles.heroLocationText}>{user.location}</Text>
            </View>
          )}
        </LinearGradient>

        {/* Stats Row */}
        <View style={[styles.statsRow, Shadow.md]}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon as any} size={16} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Partner Info */}
        {(user?.relationshipType === 'dating' || user?.relationshipType === 'married') && user?.partnerName && (
          <View style={[styles.partnerCard, Shadow.sm]}>
            <View style={styles.partnerLeft}>
              <LinearGradient
                colors={['#FF6B9D', '#E85585']}
                style={styles.partnerAvatar}
              >
                <Text style={styles.partnerInitial}>{user.partnerName[0]}</Text>
              </LinearGradient>
              <View>
                <Text style={styles.partnerLabel}>Your Partner</Text>
                <Text style={styles.partnerName}>{user.partnerName}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.inviteBtn}>
              <Text style={styles.inviteBtnText}>Invite to Datefully</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tabs: Saved / Memories */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.profileTab, activeTab === 'saved' && styles.profileTabActive]}
            onPress={() => setActiveTab('saved')}
          >
            <Ionicons
              name={activeTab === 'saved' ? 'heart' : 'heart-outline'}
              size={16}
              color={activeTab === 'saved' ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.profileTabText, activeTab === 'saved' && styles.profileTabTextActive]}>
              Saved ({savedIdeas.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.profileTab, activeTab === 'memories' && styles.profileTabActive]}
            onPress={() => setActiveTab('memories')}
          >
            <Ionicons
              name={activeTab === 'memories' ? 'images' : 'images-outline'}
              size={16}
              color={activeTab === 'memories' ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.profileTabText, activeTab === 'memories' && styles.profileTabTextActive]}>
              Memories
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'saved' ? (
          <View style={styles.savedList}>
            {savedIdeaObjects.length === 0 ? (
              <View style={styles.emptyTab}>
                <Text style={styles.emptyEmoji}>💾</Text>
                <Text style={styles.emptyTitle}>Nothing saved yet</Text>
                <Text style={styles.emptySubtitle}>
                  Heart date ideas to save them here for later.
                </Text>
              </View>
            ) : (
              savedIdeaObjects.map((idea) => (
                <DateIdeaCard
                  key={idea.id}
                  idea={idea}
                  onPress={() => {}}
                  variant="horizontal"
                />
              ))
            )}
          </View>
        ) : (
          <View style={styles.memoriesTab}>
            <View style={styles.emptyTab}>
              <Text style={styles.emptyEmoji}>📸</Text>
              <Text style={styles.emptyTitle}>No memories yet</Text>
              <Text style={styles.emptySubtitle}>
                After completing a date, add photos and notes to capture the memory forever.
              </Text>
            </View>
          </View>
        )}

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>Settings</Text>

          <View style={[styles.settingsCard, Shadow.sm]}>
            <SettingsRow
              icon="notifications-outline"
              label="Push Notifications"
              right={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ true: Colors.primary, false: Colors.gray300 }}
                  thumbColor={Colors.white}
                />
              }
            />
            <SettingsDivider />
            <SettingsRow
              icon="time-outline"
              label="Save Date History"
              right={
                <Switch
                  value={saveHistory}
                  onValueChange={setSaveHistory}
                  trackColor={{ true: Colors.primary, false: Colors.gray300 }}
                  thumbColor={Colors.white}
                />
              }
            />
            <SettingsDivider />
            <SettingsRow
              icon="location-outline"
              label="Location Services"
              rightIcon="chevron-forward"
              onPress={() => {}}
            />
          </View>

          <View style={[styles.settingsCard, Shadow.sm, { marginTop: Spacing.md }]}>
            <SettingsRow
              icon="person-outline"
              label="Edit Profile"
              rightIcon="chevron-forward"
              onPress={() => {}}
            />
            <SettingsDivider />
            <SettingsRow
              icon="shield-checkmark-outline"
              label="Privacy & Security"
              rightIcon="chevron-forward"
              onPress={() => {}}
            />
            <SettingsDivider />
            <SettingsRow
              icon="help-circle-outline"
              label="Help & Support"
              rightIcon="chevron-forward"
              onPress={() => {}}
            />
            <SettingsDivider />
            <SettingsRow
              icon="star-outline"
              label="Rate Datefully"
              rightIcon="chevron-forward"
              onPress={() => {}}
            />
          </View>

          {/* Logout */}
          <TouchableOpacity style={[styles.logoutBtn, Shadow.sm]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.version}>Datefully v1.0.0 · Made with 💕</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const SettingsRow: React.FC<{
  icon: string;
  label: string;
  right?: React.ReactNode;
  rightIcon?: string;
  onPress?: () => void;
  danger?: boolean;
}> = ({ icon, label, right, rightIcon, onPress, danger }) => (
  <TouchableOpacity
    style={styles.settingsRow}
    onPress={onPress}
    disabled={!onPress && !right}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={[styles.settingsIcon, danger && { backgroundColor: Colors.error + '15' }]}>
      <Ionicons name={icon as any} size={18} color={danger ? Colors.error : Colors.primary} />
    </View>
    <Text style={[styles.settingsLabel, danger && { color: Colors.error }]}>{label}</Text>
    <View style={styles.settingsRight}>
      {right}
      {rightIcon && (
        <Ionicons name={rightIcon as any} size={18} color={Colors.textMuted} />
      )}
    </View>
  </TouchableOpacity>
);

const SettingsDivider = () => <View style={styles.settingsDivider} />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hero: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    alignItems: 'center',
    gap: Spacing.sm,
  },
  heroTop: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 1,
  },
  avatarEdit: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  heroName: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.white,
  },
  heroEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    marginTop: 4,
  },
  heroBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },
  heroLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroLocationText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.base,
    marginTop: -Spacing.base,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    zIndex: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  partnerCard: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  partnerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  partnerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerInitial: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
  },
  partnerLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  partnerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  inviteBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  inviteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  tabsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.base,
    marginTop: Spacing.xl,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: 4,
  },
  profileTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
  },
  profileTabActive: {
    backgroundColor: Colors.surfaceAlt,
  },
  profileTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  profileTabTextActive: {
    color: Colors.primary,
  },
  savedList: {
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.md,
  },
  memoriesTab: {
    marginTop: Spacing.md,
  },
  emptyTab: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    gap: Spacing.md,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing['2xl'],
  },
  settingsSection: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
    gap: 4,
  },
  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  settingsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.md,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  settingsRight: {
    alignItems: 'center',
  },
  settingsDivider: {
    height: 1,
    backgroundColor: Colors.gray100,
    marginLeft: 68,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1.5,
    borderColor: Colors.error + '30',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.error,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: Spacing.xl,
  },
});
