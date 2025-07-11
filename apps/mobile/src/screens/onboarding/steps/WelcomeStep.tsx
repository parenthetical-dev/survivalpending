import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../../../components/ui';
import { spacing } from '../../../utils/theme';
import { getFontFamily } from '../../../utils/fonts';

interface WelcomeStepProps {
  user: any;
}

export function WelcomeStep({ user }: WelcomeStepProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="h1" align="center" style={styles.title}>
          Welcome
        </Text>
        
        <Text variant="h3" align="center" style={styles.username}>
          {user?.username || 'Anonymous User'}
        </Text>

        <Text variant="body" color="muted" align="center" style={styles.description}>
          You've taken the first step in documenting your truth. 
          Your voice matters, and your story deserves to be heard.
        </Text>

        <View style={styles.infoBox}>
          <Text variant="h5" style={styles.infoTitle}>
            Why We're Here
          </Text>
          <Text variant="body" color="muted" style={styles.infoText}>
            In times of uncertainty, our stories become our resistance. 
            This platform ensures that LGBTQ+ voices cannot be silenced or erased.
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text variant="h6">🔒</Text>
            <Text variant="caption" color="muted">Completely Anonymous</Text>
          </View>
          <View style={styles.feature}>
            <Text variant="h6">🎤</Text>
            <Text variant="caption" color="muted">AI Voice Protection</Text>
          </View>
          <View style={styles.feature}>
            <Text variant="h6">🚪</Text>
            <Text variant="caption" color="muted">Quick Exit Available</Text>
          </View>
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
  username: {
    fontFamily: getFontFamily('mono'),
    marginBottom: spacing[8],
  },
  description: {
    marginBottom: spacing[8],
    maxWidth: 300,
    lineHeight: 24,
  },
  infoBox: {
    width: '100%',
    maxWidth: 350,
    marginBottom: spacing[8],
  },
  infoTitle: {
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  infoText: {
    textAlign: 'center',
    lineHeight: 22,
  },
  features: {
    flexDirection: 'row',
    gap: spacing[6],
  },
  feature: {
    alignItems: 'center',
    gap: spacing[1],
  },
});