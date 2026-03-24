import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Spacing, BorderRadius, Shadow } from '../constants';
import { useAuthStore, useAppStore } from '../store';

// Auth
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';

// Home
import { HomeScreen } from '../screens/home/HomeScreen';
import { DateIdeaDetailScreen } from '../screens/home/DateIdeaDetailScreen';

// Explore
import { ExploreScreen } from '../screens/explore/ExploreScreen';

// Plan
import { PlanScreen } from '../screens/plan/PlanScreen';
import { PlanDetailScreen } from '../screens/plan/PlanDetailScreen';
import { CreatePlanScreen } from '../screens/plan/CreatePlanScreen';

// Reservations
import { ReservationsScreen } from '../screens/reservations/ReservationsScreen';
import { RestaurantDetailScreen } from '../screens/reservations/RestaurantDetailScreen';
import { BookTableScreen } from '../screens/reservations/BookTableScreen';
import { ReservationConfirmationScreen } from '../screens/reservations/ReservationConfirmationScreen';

// Profile & Notifications
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ExploreStack = createNativeStackNavigator();
const PlanStack = createNativeStackNavigator();
const ReservationsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const TAB_CONFIG = [
  { name: 'HomeTab', label: 'Home', icon: 'home', iconOutline: 'home-outline' },
  { name: 'ExploreTab', label: 'Explore', icon: 'compass', iconOutline: 'compass-outline' },
  { name: 'PlanTab', label: 'Plan', icon: 'calendar', iconOutline: 'calendar-outline', center: true },
  { name: 'ReservationsTab', label: 'Reserve', icon: 'restaurant', iconOutline: 'restaurant-outline' },
  { name: 'ProfileTab', label: 'You', icon: 'person', iconOutline: 'person-outline' },
];

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const { unreadNotifications } = useAppStore();

  return (
    <View style={tabStyles.container}>
      <View style={tabStyles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const config = TAB_CONFIG.find((t) => t.name === route.name);
          const isFocused = state.index === index;
          const isCenter = config?.center;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (isCenter) {
            return (
              <TouchableOpacity key={route.key} onPress={onPress} style={tabStyles.centerTab}>
                <LinearGradient
                  colors={isFocused ? ['#FF6B9D', '#E85585'] : ['#9B59B6', '#6C3483']}
                  style={tabStyles.centerButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons
                    name={(isFocused ? config?.icon : config?.iconOutline) as any}
                    size={24}
                    color={Colors.white}
                  />
                </LinearGradient>
                <Text style={[tabStyles.centerLabel, isFocused && tabStyles.labelActive]}>
                  {config?.label}
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={tabStyles.tab}
              activeOpacity={0.8}
            >
              <View style={[tabStyles.iconContainer, isFocused && tabStyles.iconContainerActive]}>
                <Ionicons
                  name={(isFocused ? config?.icon : config?.iconOutline) as any}
                  size={22}
                  color={isFocused ? Colors.primary : Colors.tabInactive}
                />
                {/* Notification badge on Profile tab */}
                {route.name === 'ProfileTab' && unreadNotifications > 0 && (
                  <View style={tabStyles.badge}>
                    <Text style={tabStyles.badgeText}>
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[tabStyles.label, isFocused && tabStyles.labelActive]}>
                {config?.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ── Nested Stacks ────────────────────────────────────────────

const HomeNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
    <HomeStack.Screen
      name="DateIdeaDetail"
      component={DateIdeaDetailScreen}
      options={{ animation: 'slide_from_right' }}
    />
  </HomeStack.Navigator>
);

const ExploreNavigator = () => (
  <ExploreStack.Navigator screenOptions={{ headerShown: false }}>
    <ExploreStack.Screen name="ExploreScreen" component={ExploreScreen} />
    <ExploreStack.Screen
      name="DateIdeaDetail"
      component={DateIdeaDetailScreen}
      options={{ animation: 'slide_from_right' }}
    />
  </ExploreStack.Navigator>
);

const PlanNavigator = () => (
  <PlanStack.Navigator screenOptions={{ headerShown: false }}>
    <PlanStack.Screen name="PlansScreen" component={PlanScreen} />
    <PlanStack.Screen
      name="PlanDetail"
      component={PlanDetailScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <PlanStack.Screen
      name="CreatePlan"
      component={CreatePlanScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
  </PlanStack.Navigator>
);

const ReservationsNavigator = () => (
  <ReservationsStack.Navigator screenOptions={{ headerShown: false }}>
    <ReservationsStack.Screen name="ReservationsScreen" component={ReservationsScreen} />
    <ReservationsStack.Screen
      name="RestaurantDetail"
      component={RestaurantDetailScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <ReservationsStack.Screen
      name="BookTable"
      component={BookTableScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
    <ReservationsStack.Screen
      name="ReservationConfirmation"
      component={ReservationConfirmationScreen}
      options={{ animation: 'fade' }}
    />
  </ReservationsStack.Navigator>
);

const ProfileNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} />
    <ProfileStack.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{ animation: 'slide_from_right' }}
    />
  </ProfileStack.Navigator>
);

// ── Main Tabs ────────────────────────────────────────────────

const MainTabs = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="HomeTab" component={HomeNavigator} />
    <Tab.Screen name="ExploreTab" component={ExploreNavigator} />
    <Tab.Screen name="PlanTab" component={PlanNavigator} />
    <Tab.Screen name="ReservationsTab" component={ReservationsNavigator} />
    <Tab.Screen name="ProfileTab" component={ProfileNavigator} />
  </Tab.Navigator>
);

// ── Root Navigator ───────────────────────────────────────────

export const AppNavigator = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        ) : (
          <Stack.Screen name="MainTabs" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// ── Tab Bar Styles ───────────────────────────────────────────

const tabStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.base,
    paddingBottom: 20,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    ...Shadow.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  centerTab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    marginTop: -24,
  },
  iconContainer: {
    width: 44,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    position: 'relative',
  },
  iconContainerActive: {
    backgroundColor: Colors.surfaceAlt,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.tabInactive,
  },
  labelActive: {
    color: Colors.primary,
  },
  centerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
});
