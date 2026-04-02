import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types';

// Main screens
import SplashScreen from '../screens/SplashScreen';
import WhosPlanning from '../screens/WhosPlanning';
import BudgetScreen from '../screens/BudgetScreen';
import PartnerProfileScreen from '../screens/PartnerProfileScreen';
import AIChatScreen from '../screens/AIChatScreen';
import DateOptionsScreen from '../screens/DateOptionsScreen';
import VendorMarketplace from '../screens/VendorMarketplace';
import InvitationCard from '../screens/InvitationCard';
import ConfirmationScreen from '../screens/ConfirmationScreen';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

// Error screens
import AIErrorScreen from '../screens/errors/AIErrorScreen';
import LocationErrorScreen from '../screens/errors/LocationErrorScreen';
import BudgetTooLowScreen from '../screens/errors/BudgetTooLowScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' },
          animation: 'slide_from_right',
        }}
      >
        {/* Main flow */}
        <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="WhosPlanning" component={WhosPlanning} />
        <Stack.Screen name="Budget" component={BudgetScreen} />
        <Stack.Screen name="PartnerProfile" component={PartnerProfileScreen} />
        <Stack.Screen name="AIChat" component={AIChatScreen} />
        <Stack.Screen name="DateOptions" component={DateOptionsScreen} />
        <Stack.Screen name="VendorMarketplace" component={VendorMarketplace} />
        <Stack.Screen name="InvitationCard" component={InvitationCard} />
        <Stack.Screen name="Confirmation" component={ConfirmationScreen} />

        {/* Auth */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />

        {/* Error screens */}
        <Stack.Screen name="AIError" component={AIErrorScreen} />
        <Stack.Screen name="LocationError" component={LocationErrorScreen} />
        <Stack.Screen name="BudgetTooLow" component={BudgetTooLowScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
