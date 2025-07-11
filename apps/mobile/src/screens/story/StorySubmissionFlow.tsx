import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useHaptics } from '../../hooks/useHaptics';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Text } from '../../components/ui';
import { ProgressDots } from '../../components/ProgressDots';
import { SafeAreaView } from '../../components/SafeAreaView';
import { QuickExitButton } from '../../components/QuickExitButton';
import { spacing } from '../../utils/theme';
import { storiesApi } from '../../api/stories';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import story submission stages
import { WriteStage } from './stages/WriteStage';
import { RefineStage } from './stages/RefineStage';
import { VoiceStage } from './stages/VoiceStage';
import { PreviewStage } from './stages/PreviewStage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAFT_KEY = '@story_draft';

export interface StoryData {
  content: string;
  refinedContent?: string;
  voiceId?: string;
  audioUrl?: string;
  category?: string;
}

export function StorySubmissionFlow() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { colors } = useTheme();
  const haptics = useHaptics();
  const scrollViewRef = useRef<ScrollView>(null);

  const [currentStage, setCurrentStage] = useState(0);
  const [storyData, setStoryData] = useState<StoryData>({
    content: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stages = [
    { title: 'Write', component: WriteStage },
    { title: 'Refine', component: RefineStage },
    { title: 'Voice', component: VoiceStage },
    { title: 'Preview', component: PreviewStage },
  ];

  // Load draft on mount
  useEffect(() => {
    loadDraft();
  }, []);

  // Save draft whenever story content changes
  useEffect(() => {
    if (storyData.content) {
      saveDraft();
    }
  }, [storyData.content]);

  const loadDraft = async () => {
    try {
      const draft = await AsyncStorage.getItem(DRAFT_KEY);
      if (draft) {
        const parsedDraft = JSON.parse(draft);
        setStoryData(parsedDraft);
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  };

  const saveDraft = async () => {
    try {
      await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(storyData));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  const clearDraft = async () => {
    try {
      await AsyncStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  };

  const handleNext = () => {
    if (currentStage < stages.length - 1) {
      const nextStage = currentStage + 1;
      setCurrentStage(nextStage);
      scrollViewRef.current?.scrollTo({
        x: nextStage * SCREEN_WIDTH,
        animated: true,
      });
      haptics.stageTransition();
    }
  };

  const handleBack = () => {
    if (currentStage > 0) {
      const prevStage = currentStage - 1;
      setCurrentStage(prevStage);
      scrollViewRef.current?.scrollTo({
        x: prevStage * SCREEN_WIDTH,
        animated: true,
      });
      haptics.light();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    haptics.medium();

    try {
      // Categorize the story if not already done
      let category = storyData.category;
      if (!category && storyData.refinedContent) {
        const categorization = await storiesApi.categorizeStory(
          storyData.refinedContent || storyData.content
        );
        category = categorization.category;
      }

      // Submit the story
      await storiesApi.submitStory({
        content: storyData.content,
        refinedContent: storyData.refinedContent,
        voiceId: storyData.voiceId!,
        audioUrl: storyData.audioUrl,
        category,
      });

      // Clear draft
      await clearDraft();

      // Success haptic
      await haptics.submission();

      // Navigate to success screen
      navigation.replace('StorySuccess' as any);
    } catch (error: any) {
      haptics.error();
      Alert.alert(
        'Submission Failed',
        error.message || 'Failed to submit your story. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStage) {
      case 0: // Write
        return storyData.content.length >= 50;
      case 1: // Refine
        return true; // Can skip refinement
      case 2: // Voice
        return !!storyData.voiceId;
      case 3: // Preview
        return !!storyData.audioUrl;
      default:
        return false;
    }
  };

  const StageComponent = stages[currentStage].component;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <QuickExitButton />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text variant="h5">Share Your Story</Text>
          <ProgressDots total={stages.length} current={currentStage} />
        </View>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
        >
          {stages.map((_, index) => (
            <View key={index} style={styles.stageContainer}>
              <StageComponent
                storyData={storyData}
                setStoryData={setStoryData}
                onNext={handleNext}
              />
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          {currentStage > 0 && (
            <Button
              variant="outline"
              onPress={handleBack}
              style={styles.footerButton}
            >
              Back
            </Button>
          )}
          
          {currentStage < stages.length - 1 ? (
            <Button
              onPress={handleNext}
              disabled={!canProceed()}
              style={styles.footerButton}
            >
              Continue
            </Button>
          ) : (
            <Button
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={!canProceed()}
              style={styles.footerButton}
            >
              Submit Story
            </Button>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    alignItems: 'center',
    gap: spacing[3],
  },
  scrollView: {
    flex: 1,
  },
  stageContainer: {
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