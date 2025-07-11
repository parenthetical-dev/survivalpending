import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { SignupScreen } from './src/screens/SignupScreen';
import { OnboardingScreen } from './src/screens/onboarding/OnboardingScreen';
import { StorySubmissionScreen } from './src/screens/StorySubmissionScreen';
import { loadFonts } from './src/utils/fonts';
import { quickExit } from './src/services/quickExit';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Signup: undefined;
  StorySubmission: undefined;
  Onboarding: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    async function loadAppFonts() {
      await loadFonts();
      setFontsLoaded(true);
    }
    loadAppFonts();
  }, []);

  useEffect(() => {
    // Initialize quick exit with navigation ref
    if (navigationRef.current) {
      quickExit.initialize(navigationRef);
    }

    return () => {
      quickExit.stop();
    };
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer ref={navigationRef}>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#000',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ title: 'Survival Pending' }}
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ title: 'Sign In' }}
            />
            <Stack.Screen 
              name="Signup" 
              component={SignupScreen} 
              options={{ title: 'Create Account' }}
            />
            <Stack.Screen 
              name="Onboarding" 
              component={OnboardingScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="StorySubmission" 
              component={StorySubmissionScreen}
              options={{ title: 'Share Your Story' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}