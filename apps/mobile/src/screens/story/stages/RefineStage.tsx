import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text, Button, Card, CardContent, Skeleton } from '../../../components/ui';
import { useTheme } from '../../../contexts/ThemeContext';
import { useHaptics } from '../../../hooks/useHaptics';
import { spacing, radius } from '../../../utils/theme';
import { storiesApi } from '../../../api/stories';
import type { StoryData } from '../StorySubmissionFlow';

interface RefineStageProps {
  storyData: StoryData;
  setStoryData: (data: StoryData) => void;
  onNext: () => void;
}

export function RefineStage({ storyData, setStoryData, onNext }: RefineStageProps) {
  const { colors } = useTheme();
  const haptics = useHaptics();
  const [isRefining, setIsRefining] = useState(false);
  const [refinedVersion, setRefinedVersion] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<'original' | 'refined'>('original');

  const handleRefine = async () => {
    setIsRefining(true);
    haptics.medium();

    try {
      const result = await storiesApi.refineStory(storyData.content);
      setRefinedVersion(result.refined);
      setShowComparison(true);
      haptics.success();
    } catch (error) {
      haptics.error();
      console.error('Failed to refine story:', error);
    } finally {
      setIsRefining(false);
    }
  };

  const handleSelectVersion = (version: 'original' | 'refined') => {
    setSelectedVersion(version);
    haptics.light();
    
    if (version === 'refined') {
      setStoryData({ ...storyData, refinedContent: refinedVersion });
    } else {
      setStoryData({ ...storyData, refinedContent: undefined });
    }
  };

  const handleSkip = () => {
    haptics.light();
    onNext();
  };

  const handleContinue = () => {
    haptics.medium();
    onNext();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text variant="h3" align="center" style={styles.title}>
          Optional: Refine Your Story
        </Text>
        
        <Text variant="body" color="muted" align="center" style={styles.subtitle}>
          Our AI can help improve clarity while preserving your authentic voice. 
          This step is completely optional.
        </Text>

        {!showComparison && !isRefining && (
          <>
            <Card style={styles.previewCard}>
              <CardContent>
                <Text variant="caption" weight="semibold" style={styles.previewLabel}>
                  Your story:
                </Text>
                <Text variant="body" style={styles.previewText}>
                  {storyData.content}
                </Text>
              </CardContent>
            </Card>

            <Button
              onPress={handleRefine}
              fullWidth
              size="lg"
              style={styles.refineButton}
            >
              Suggest Improvements
            </Button>

            <Button
              variant="ghost"
              onPress={handleSkip}
              fullWidth
            >
              Skip This Step
            </Button>
          </>
        )}

        {isRefining && (
          <View style={styles.loadingContainer}>
            <Skeleton height={200} style={styles.loadingSkeleton} />
            <Text variant="body" color="muted" align="center" style={styles.loadingText}>
              Analyzing your story...
            </Text>
          </View>
        )}

        {showComparison && !isRefining && (
          <>
            <View style={styles.comparisonContainer}>
              <TouchableOpacity
                onPress={() => handleSelectVersion('original')}
                style={[
                  styles.versionCard,
                  selectedVersion === 'original' && styles.selectedCard,
                  { borderColor: selectedVersion === 'original' ? colors.primary : colors.border }
                ]}
              >
                <Text variant="h6" style={styles.versionTitle}>
                  Original
                </Text>
                <ScrollView style={styles.versionScroll} nestedScrollEnabled>
                  <Text variant="body" style={styles.versionText}>
                    {storyData.content}
                  </Text>
                </ScrollView>
                {selectedVersion === 'original' && (
                  <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
                    <Text variant="caption" style={{ color: colors.primaryForeground }}>
                      Selected
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSelectVersion('refined')}
                style={[
                  styles.versionCard,
                  selectedVersion === 'refined' && styles.selectedCard,
                  { borderColor: selectedVersion === 'refined' ? colors.primary : colors.border }
                ]}
              >
                <Text variant="h6" style={styles.versionTitle}>
                  Refined
                </Text>
                <ScrollView style={styles.versionScroll} nestedScrollEnabled>
                  <Text variant="body" style={styles.versionText}>
                    {refinedVersion}
                  </Text>
                </ScrollView>
                {selectedVersion === 'refined' && (
                  <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
                    <Text variant="caption" style={{ color: colors.primaryForeground }}>
                      Selected
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <Text variant="caption" color="muted" align="center" style={styles.selectionHint}>
              Tap to select which version you prefer
            </Text>

            <Button
              onPress={handleContinue}
              fullWidth
              size="lg"
              style={styles.continueButton}
            >
              Continue with {selectedVersion === 'refined' ? 'Refined' : 'Original'}
            </Button>
          </>
        )}

        <View style={[styles.infoBox, { backgroundColor: colors.muted }]}>
          <Text variant="caption" weight="semibold">
            🤖 About AI refinement
          </Text>
          <Text variant="caption" color="muted" style={styles.infoText}>
            • Improves clarity and flow{'\n'}
            • Fixes grammar and spelling{'\n'}
            • Preserves your authentic voice{'\n'}
            • You always have final say
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
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
  previewCard: {
    marginBottom: spacing[6],
  },
  previewLabel: {
    marginBottom: spacing[2],
  },
  previewText: {
    lineHeight: 24,
  },
  refineButton: {
    marginBottom: spacing[3],
  },
  loadingContainer: {
    marginVertical: spacing[8],
  },
  loadingSkeleton: {
    marginBottom: spacing[4],
  },
  loadingText: {
    marginTop: spacing[2],
  },
  comparisonContainer: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  versionCard: {
    flex: 1,
    borderWidth: 2,
    borderRadius: radius.md,
    padding: spacing[3],
    maxHeight: 300,
  },
  selectedCard: {
    borderWidth: 2,
  },
  versionTitle: {
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  versionScroll: {
    flex: 1,
  },
  versionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  selectedBadge: {
    position: 'absolute',
    top: -12,
    right: -12,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },
  selectionHint: {
    marginBottom: spacing[4],
  },
  continueButton: {
    marginBottom: spacing[6],
  },
  infoBox: {
    padding: spacing[4],
    borderRadius: radius.md,
    marginTop: spacing[4],
  },
  infoText: {
    marginTop: spacing[2],
    lineHeight: 20,
  },
});