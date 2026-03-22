import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DatefullyStackParamList } from '../types';

// Datefully 6-screen flow
import { SplashScreen } from '../screens/datefully/SplashScreen';
import { PlannerSetupScreen } from '../screens/datefully/PlannerSetupScreen';
import { BudgetScreen } from '../screens/datefully/BudgetScreen';
import { PartnerProfileScreen } from '../screens/datefully/PartnerProfileScreen';
import { ResultsScreen } from '../screens/datefully/ResultsScreen';
import { ConfirmationScreen } from '../screens/datefully/ConfirmationScreen';

const Stack = createNativeStackNavigator<DatefullyStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#000000' },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="PlannerSetup" component={PlannerSetupScreen} />
        <Stack.Screen name="Budget" component={BudgetScreen} />
        <Stack.Screen name="PartnerProfile" component={PartnerProfileScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
        <Stack.Screen
          name="Confirmation"
          component={ConfirmationScreen}
          options={{ animation: 'fade_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
