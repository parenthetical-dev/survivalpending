import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Text } from '../../components/ui';
import { ProgressDots } from '../../components/ProgressDots';
import { SafeAreaView } from '../../components/SafeAreaView';
import { spacing } from '../../utils/theme';
import { STORAGE_KEYS } from '../../config/api';
import * as SecureStore from 'expo-secure-store';

// Import onboarding steps
import { WelcomeStep } from './steps/WelcomeStep';
import { CredentialsStep } from './steps/CredentialsStep';
import { SafetyStep } from './steps/SafetyStep';
import { DemographicsStep } from './steps/DemographicsStep';
import { ReviewStep } from './steps/ReviewStep';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function OnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [demographics, setDemographics] = useState({});
  const [credentialsDownloaded, setCredentialsDownloaded] = useState(false);

  const steps = [
    { title: 'Welcome', component: WelcomeStep },
    { title: 'Credentials', component: CredentialsStep },
    { title: 'Safety', component: SafetyStep },
    { title: 'Demographics', component: DemographicsStep },
    { title: 'Review', component: ReviewStep },
  ];

  const handleNext = () => {
    if (currentStep === 1 && !credentialsDownloaded) {
      Alert.alert(
        'Download Required',
        'Please download your credentials before continuing. You won\'t be able to recover your account without them.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      scrollViewRef.current?.scrollTo({
        x: nextStep * SCREEN_WIDTH,
        animated: true,
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      scrollViewRef.current?.scrollTo({
        x: prevStep * SCREEN_WIDTH,
        animated: true,
      });
    }
  };

  const handleComplete = async () => {
    try {
      // Mark onboarding as complete
      await SecureStore.setItemAsync(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
      
      // Navigate to home
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Onboarding?',
      'You can always access safety information and settings from your dashboard.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: handleComplete },
      ]
    );
  };

  const StepComponent = steps[currentStep].component;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <ProgressDots total={steps.length} current={currentStep} />
        {currentStep > 2 && (
          <Button
            variant="ghost"
            size="sm"
            onPress={handleSkip}
            style={styles.skipButton}
          >
            <Text variant="caption" color="muted">Skip</Text>
          </Button>
        )}
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {steps.map((_, index) => (
          <View key={index} style={styles.stepContainer}>
            <StepComponent
              user={user}
              demographics={demographics}
              setDemographics={setDemographics}
              credentialsDownloaded={credentialsDownloaded}
              setCredentialsDownloaded={setCredentialsDownloaded}
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 0 && (
          <Button
            variant="outline"
            onPress={handleBack}
            style={styles.footerButton}
          >
            Back
          </Button>
        )}
        
        <Button
          onPress={currentStep === steps.length - 1 ? handleComplete : handleNext}
          style={styles.footerButton}
        >
          {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  skipButton: {
    position: 'absolute',
    right: spacing[5],
    top: spacing[4],
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: spacing[5],
  },
  footer: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  footerButton: {
    flex: 1,
  },
});