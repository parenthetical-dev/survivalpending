import React from 'react';
import { View, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Text, Card, CardContent } from '../../../components/ui';
import { spacing } from '../../../utils/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { CRISIS_RESOURCES } from '../../../api/crisis';

interface ReviewStepProps {
  demographics: any;
}

export function ReviewStep({ demographics }: ReviewStepProps) {
  const { colors } = useTheme();

  const handleResourcePress = (url?: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="h2" align="center" style={styles.title}>
          You're All Set! 🎉
        </Text>

        <Text variant="body" color="muted" align="center" style={styles.description}>
          You're ready to share your story and join a community of voices that refuse to be silenced.
        </Text>

        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text variant="h6">✓</Text>
            <Text variant="body" color="muted">Anonymous account created</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text variant="h6">✓</Text>
            <Text variant="body" color="muted">Credentials saved securely</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text variant="h6">✓</Text>
            <Text variant="body" color="muted">Safety features understood</Text>
          </View>
          {Object.keys(demographics).length > 0 && (
            <View style={styles.summaryItem}>
              <Text variant="h6">✓</Text>
              <Text variant="body" color="muted">Demographics shared (optional)</Text>
            </View>
          )}
        </View>

        <Card style={styles.resourcesCard}>
          <CardContent>
            <Text variant="h6" style={styles.resourcesTitle}>
              Crisis Resources
            </Text>
            <Text variant="caption" color="muted" style={styles.resourcesSubtitle}>
              If you need support, these resources are here for you:
            </Text>
            
            {CRISIS_RESOURCES.map((resource) => (
              <TouchableOpacity
                key={resource.name}
                onPress={() => handleResourcePress(resource.url)}
                style={styles.resource}
              >
                <Text variant="body" weight="medium">
                  {resource.name}
                </Text>
                <Text variant="caption" color="muted">
                  {resource.phone || resource.text}
                </Text>
              </TouchableOpacity>
            ))}
          </CardContent>
        </Card>

        <View style={[styles.tipBox, { backgroundColor: colors.primary + '10' }]}>
          <Text variant="caption" weight="semibold">
            What's Next?
          </Text>
          <Text variant="caption" color="muted" style={styles.tipText}>
            • Share your story when you're ready{'\n'}
            • Listen to others in the community{'\n'}
            • Remember: your voice matters
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    marginBottom: spacing[4],
  },
  description: {
    marginBottom: spacing[8],
    maxWidth: 300,
    lineHeight: 24,
  },
  summary: {
    gap: spacing[3],
    marginBottom: spacing[8],
    width: '100%',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  resourcesCard: {
    width: '100%',
    marginBottom: spacing[6],
  },
  resourcesTitle: {
    marginBottom: spacing[1],
  },
  resourcesSubtitle: {
    marginBottom: spacing[4],
  },
  resource: {
    paddingVertical: spacing[2],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  tipBox: {
    padding: spacing[4],
    borderRadius: 8,
    width: '100%',
  },
  tipText: {
    marginTop: spacing[2],
    lineHeight: 20,
  },
});