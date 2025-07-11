import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, Card, CardContent } from '../../../components/ui';
import { useTheme } from '../../../contexts/ThemeContext';
import { spacing, radius } from '../../../utils/theme';
import type { StoryData } from '../StorySubmissionFlow';

interface WriteStageProps {
  storyData: StoryData;
  setStoryData: (data: StoryData) => void;
  onNext: () => void;
}

const MAX_CHARACTERS = 1000;
const MIN_CHARACTERS = 50;

const PROMPTS = [
  "What moment made you realize you're stronger than you thought?",
  "When did you first feel truly seen for who you are?",
  "What would you tell your younger self?",
  "Describe a moment of unexpected acceptance.",
  "What gives you hope when things feel impossible?",
  "Share a time when you found your chosen family.",
  "What moment made you proud to be who you are?",
  "Describe a small victory that meant everything.",
];

export function WriteStage({ storyData, setStoryData }: WriteStageProps) {
  const { colors } = useTheme();
  const [lastActiveTime, setLastActiveTime] = useState(Date.now());
  const [showPrompt, setShowPrompt] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(PROMPTS[0]);

  const characterCount = storyData.content.length;

  // Idle detection
  useEffect(() => {
    const interval = setInterval(() => {
      const idleTime = Date.now() - lastActiveTime;
      if (idleTime > 30000 && !showPrompt && characterCount < MIN_CHARACTERS) {
        // Show prompt after 30 seconds of inactivity
        setShowPrompt(true);
        setCurrentPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [lastActiveTime, showPrompt, characterCount]);

  const handleTextChange = (text: string) => {
    setStoryData({ ...storyData, content: text });
    setLastActiveTime(Date.now());
    setShowPrompt(false);
  };

  const getCharacterCountColor = () => {
    if (characterCount < MIN_CHARACTERS) return colors.muted;
    if (characterCount > MAX_CHARACTERS) return colors.destructive;
    if (characterCount > MAX_CHARACTERS - 100) return colors.warning;
    return colors.success;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="h3" align="center" style={styles.title}>
          Your Story Matters
        </Text>
        
        <Text variant="body" color="muted" align="center" style={styles.subtitle}>
          Share your truth in your own words. This is your space.
        </Text>

        {showPrompt && (
          <Card style={[styles.promptCard, { backgroundColor: colors.secondary }]}>
            <CardContent>
              <Text variant="caption" weight="semibold">
                Need inspiration?
              </Text>
              <Text variant="body" style={styles.promptText}>
                {currentPrompt}
              </Text>
            </CardContent>
          </Card>
        )}

        <View style={[styles.editorContainer, { borderColor: colors.border }]}>
          <TextInput
            style={[
              styles.textInput,
              { color: colors.foreground },
            ]}
            placeholder="Start typing your story..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            value={storyData.content}
            onChangeText={handleTextChange}
            maxLength={MAX_CHARACTERS + 100} // Allow some overflow
            textAlignVertical="top"
            autoFocus
          />
        </View>

        <View style={styles.footer}>
          <Text
            variant="caption"
            style={[styles.characterCount, { color: getCharacterCountColor() }]}
          >
            {characterCount} / {MAX_CHARACTERS} characters
            {characterCount < MIN_CHARACTERS && ` (${MIN_CHARACTERS - characterCount} more needed)`}
          </Text>
          
          <Text variant="caption" color="muted" style={styles.timeEstimate}>
            ≈ {Math.ceil(characterCount / 11)} seconds of audio
          </Text>
        </View>

        <View style={[styles.infoBox, { backgroundColor: colors.muted }]}>
          <Text variant="caption" weight="semibold">
            💡 Tips for sharing
          </Text>
          <Text variant="caption" color="muted" style={styles.infoText}>
            • Be authentic - your voice is unique{'\n'}
            • No need for perfect grammar{'\n'}
            • Focus on how you felt{'\n'}
            • Your story will be anonymous
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing[4],
  },
  title: {
    marginBottom: spacing[2],
  },
  subtitle: {
    marginBottom: spacing[6],
    maxWidth: 300,
    alignSelf: 'center',
  },
  promptCard: {
    marginBottom: spacing[4],
  },
  promptText: {
    marginTop: spacing[2],
    fontStyle: 'italic',
  },
  editorContainer: {
    borderWidth: 1,
    borderRadius: radius.md,
    minHeight: 300,
    maxHeight: 400,
    marginBottom: spacing[3],
  },
  textInput: {
    flex: 1,
    padding: spacing[4],
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  characterCount: {
    fontWeight: '500',
  },
  timeEstimate: {
    fontStyle: 'italic',
  },
  infoBox: {
    padding: spacing[4],
    borderRadius: radius.md,
  },
  infoText: {
    marginTop: spacing[2],
    lineHeight: 20,
  },
});