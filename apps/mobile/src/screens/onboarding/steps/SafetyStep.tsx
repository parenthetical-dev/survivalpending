import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, CardContent } from '../../../components/ui';
import { spacing, radius } from '../../../utils/theme';
import { useTheme } from '../../../contexts/ThemeContext';

interface SafetyStepProps {}

export function SafetyStep({}: SafetyStepProps) {
  const { colors } = useTheme();
  const [exitCount, setExitCount] = useState(0);

  const handleQuickExitDemo = () => {
    setExitCount(prev => prev + 1);
    if (exitCount >= 2) {
      setExitCount(0);
      // In real app, this would trigger quick exit
      Alert.alert('Demo', 'Quick Exit would be triggered! (Demo only)');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="h2" align="center" style={styles.title}>
          Your Safety Matters
        </Text>

        <Text variant="body" color="muted" align="center" style={styles.description}>
          We've built safety features to protect you while using this app.
        </Text>

        <View style={styles.features}>
          <Card style={styles.featureCard}>
            <CardContent>
              <Text variant="h5" style={styles.featureTitle}>
                🚪 Quick Exit
              </Text>
              <Text variant="body" color="muted" style={styles.featureText}>
                Triple-tap the exit button or shake your phone 3 times to instantly leave the app. 
                It will clear all data and open a weather website.
              </Text>
              
              <TouchableOpacity
                onPress={handleQuickExitDemo}
                style={[styles.demoButton, { backgroundColor: colors.destructive }]}
              >
                <Text variant="caption" style={{ color: colors.destructiveForeground }}>
                  Try it: Tap {3 - exitCount} more time{3 - exitCount !== 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            </CardContent>
          </Card>

          <Card style={styles.featureCard}>
            <CardContent>
              <Text variant="h5" style={styles.featureTitle}>
                🔒 Private Browsing
              </Text>
              <Text variant="body" color="muted" style={styles.featureText}>
                Use private/incognito mode when possible. Clear your browser history after each session.
              </Text>
            </CardContent>
          </Card>

          <Card style={styles.featureCard}>
            <CardContent>
              <Text variant="h5" style={styles.featureTitle}>
                📱 Device Security
              </Text>
              <Text variant="body" color="muted" style={styles.featureText}>
                Consider using a VPN and ensure your device is password-protected. 
                Be mindful of who has access to your phone.
              </Text>
            </CardContent>
          </Card>
        </View>

        <View style={[styles.tipBox, { backgroundColor: colors.muted }]}>
          <Text variant="caption" weight="semibold">
            💡 Pro Tip
          </Text>
          <Text variant="caption" color="muted" style={styles.tipText}>
            The quick exit button will always be visible while you're sharing your story. 
            Practice using it so you're ready if you need it.
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
    marginBottom: spacing[6],
    maxWidth: 300,
    lineHeight: 24,
  },
  features: {
    gap: spacing[4],
    width: '100%',
    marginBottom: spacing[6],
  },
  featureCard: {
    width: '100%',
  },
  featureTitle: {
    marginBottom: spacing[2],
  },
  featureText: {
    lineHeight: 22,
  },
  demoButton: {
    marginTop: spacing[3],
    padding: spacing[2],
    borderRadius: radius.md,
    alignItems: 'center',
  },
  tipBox: {
    padding: spacing[4],
    borderRadius: radius.md,
    width: '100%',
  },
  tipText: {
    marginTop: spacing[1],
    lineHeight: 20,
  },
});