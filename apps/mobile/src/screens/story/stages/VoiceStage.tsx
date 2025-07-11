import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Text, Button, Card, CardContent } from '../../../components/ui';
import { useTheme } from '../../../contexts/ThemeContext';
import { useHaptics } from '../../../hooks/useHaptics';
import { spacing } from '../../../utils/theme';
import { apiClient } from '../../../config/api';

interface VoiceOption {
  id: string;
  name: string;
  description: string;
  preview?: string;
}

const VOICE_OPTIONS: VoiceOption[] = [
  { id: 'alloy', name: 'Alloy', description: 'Clear and balanced' },
  { id: 'echo', name: 'Echo', description: 'Warm and conversational' },
  { id: 'fable', name: 'Fable', description: 'Expressive and dynamic' },
  { id: 'onyx', name: 'Onyx', description: 'Deep and authoritative' },
  { id: 'nova', name: 'Nova', description: 'Youthful and bright' },
  { id: 'shimmer', name: 'Shimmer', description: 'Soft and gentle' },
];

interface VoiceStageProps {
  storyData: any;
  setStoryData: (data: any) => void;
  onNext: () => void;
}

export function VoiceStage({ storyData, setStoryData, onNext }: VoiceStageProps) {
  const { colors } = useTheme();
  const haptics = useHaptics();
  const [selectedVoice, setSelectedVoice] = useState(storyData.voiceId || '');
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);

  const handleVoiceSelect = (voiceId: string) => {
    haptics.selection();
    setSelectedVoice(voiceId);
    setStoryData({ ...storyData, voiceId });
  };

  const handlePreview = async (voiceId: string) => {
    if (previewingVoice) return;
    
    setPreviewingVoice(voiceId);
    haptics.medium();
    
    try {
      // Preview voice with sample text
      const response = await apiClient.post('/api/voice/preview', {
        voiceId,
        text: 'This is how your story will sound with this voice.',
      });
      
      // In a real app, play the audio response
      console.log('Preview audio URL:', response.data.audioUrl);
    } catch (error) {
      console.error('Preview failed:', error);
    } finally {
      setPreviewingVoice(null);
    }
  };

  const handleContinue = () => {
    if (selectedVoice) {
      haptics.success();
      onNext();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="h3" align="center" style={styles.title}>
        Choose Your Voice
      </Text>
      
      <Text variant="body" color="muted" align="center" style={styles.subtitle}>
        Select a voice that resonates with your story
      </Text>

      <View style={styles.voiceGrid}>
        {VOICE_OPTIONS.map((voice) => (
          <TouchableOpacity
            key={voice.id}
            onPress={() => handleVoiceSelect(voice.id)}
            activeOpacity={0.7}
          >
            <Card
              style={[
                styles.voiceCard,
                selectedVoice === voice.id && {
                  borderColor: colors.primary,
                  borderWidth: 2,
                },
              ]}
            >
              <CardContent style={styles.voiceContent}>
                <View style={styles.voiceHeader}>
                  <Text variant="h5">{voice.name}</Text>
                  {selectedVoice === voice.id && (
                    <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />
                  )}
                </View>
                
                <Text variant="caption" color="muted" style={styles.voiceDescription}>
                  {voice.description}
                </Text>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => handlePreview(voice.id)}
                  disabled={previewingVoice !== null}
                  style={styles.previewButton}
                >
                  {previewingVoice === voice.id ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    'Preview'
                  )}
                </Button>
              </CardContent>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        onPress={handleContinue}
        disabled={!selectedVoice}
        style={styles.continueButton}
        fullWidth
      >
        Continue
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
  },
  title: {
    marginBottom: spacing[2],
  },
  subtitle: {
    marginBottom: spacing[6],
  },
  voiceGrid: {
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  voiceCard: {
    marginBottom: spacing[3],
  },
  voiceContent: {
    padding: spacing[3],
  },
  voiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  voiceDescription: {
    marginBottom: spacing[3],
  },
  previewButton: {
    alignSelf: 'flex-start',
  },
  continueButton: {
    marginTop: spacing[4],
  },
});