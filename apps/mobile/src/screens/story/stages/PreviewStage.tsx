import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { Text, Button, Card, CardContent } from '../../../components/ui';
import { useTheme } from '../../../contexts/ThemeContext';
import { useHaptics } from '../../../hooks/useHaptics';
import { spacing, radius } from '../../../utils/theme';
import { apiClient } from '../../../config/api';

interface PreviewStageProps {
  storyData: any;
  setStoryData: (data: any) => void;
  onNext: () => void;
}

export function PreviewStage({ storyData, setStoryData, onNext }: PreviewStageProps) {
  const { colors } = useTheme();
  const haptics = useHaptics();
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    generateAudio();
    
    return () => {
      // Cleanup audio when component unmounts
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const generateAudio = async () => {
    setIsGenerating(true);
    
    try {
      const response = await apiClient.post('/api/voice/generate', {
        text: storyData.refinedContent || storyData.content,
        voiceId: storyData.voiceId,
      });
      
      setAudioUrl(response.data.audioUrl);
      await loadAudio(response.data.audioUrl);
    } catch (error) {
      console.error('Audio generation failed:', error);
      Alert.alert('Error', 'Failed to generate audio. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const loadAudio = async (url: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(sound);
    } catch (error) {
      console.error('Failed to load audio:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);
    }
  };

  const handlePlayPause = async () => {
    if (!sound) return;
    
    haptics.selection();
    
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const handleRestart = async () => {
    if (!sound) return;
    
    haptics.medium();
    await sound.setPositionAsync(0);
    await sound.playAsync();
  };

  const formatTime = (millis: number) => {
    const seconds = Math.floor(millis / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    haptics.success();
    setStoryData({ ...storyData, audioUrl });
    onNext();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="h3" align="center" style={styles.title}>
        Preview Your Story
      </Text>
      
      <Text variant="body" color="muted" align="center" style={styles.subtitle}>
        Listen to how your story sounds before submitting
      </Text>

      <Card style={styles.playerCard}>
        <CardContent style={styles.playerContent}>
          {isGenerating ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text variant="body" color="muted" style={styles.loadingText}>
                Generating audio...
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.storyPreview}>
                <Text variant="body" numberOfLines={4}>
                  {storyData.refinedContent || storyData.content}
                </Text>
              </View>

              <View style={styles.controls}>
                <Button
                  variant="outline"
                  size="icon"
                  onPress={handleRestart}
                  disabled={!sound}
                >
                  ⏮
                </Button>
                
                <Button
                  variant="default"
                  size="lg"
                  onPress={handlePlayPause}
                  disabled={!sound}
                  style={styles.playButton}
                >
                  {isPlaying ? '⏸' : '▶'}
                </Button>
                
                <View style={styles.timeDisplay}>
                  <Text variant="caption" color="muted">
                    {formatTime(position)} / {formatTime(duration)}
                  </Text>
                </View>
              </View>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: duration > 0 ? `${(position / duration) * 100}%` : '0%',
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
            </>
          )}
        </CardContent>
      </Card>

      <View style={styles.actions}>
        <Button
          variant="outline"
          onPress={() => generateAudio()}
          disabled={isGenerating}
          style={styles.actionButton}
        >
          Regenerate
        </Button>
        
        <Button
          onPress={handleSubmit}
          disabled={isGenerating || !audioUrl}
          style={styles.actionButton}
        >
          Submit Story
        </Button>
      </View>
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
  playerCard: {
    marginBottom: spacing[6],
  },
  playerContent: {
    padding: spacing[4],
  },
  loadingContainer: {
    alignItems: 'center',
    padding: spacing[8],
  },
  loadingText: {
    marginTop: spacing[3],
  },
  storyPreview: {
    marginBottom: spacing[4],
    padding: spacing[3],
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: radius.sm,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[4],
    marginBottom: spacing[3],
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  timeDisplay: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  actionButton: {
    flex: 1,
  },
});