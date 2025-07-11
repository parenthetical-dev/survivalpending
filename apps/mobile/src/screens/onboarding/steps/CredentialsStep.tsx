import React from 'react';
import { View, StyleSheet, Alert, Share, Platform } from 'react-native';
import { Text, Button, Card, CardContent } from '../../../components/ui';
import { spacing, radius } from '../../../utils/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { getFontFamily } from '../../../utils/fonts';

interface CredentialsStepProps {
  user: any;
  credentialsDownloaded: boolean;
  setCredentialsDownloaded: (value: boolean) => void;
}

export function CredentialsStep({ 
  user, 
  credentialsDownloaded, 
  setCredentialsDownloaded 
}: CredentialsStepProps) {
  const { colors } = useTheme();

  const downloadCredentials = async () => {
    const credentials = `SURVIVAL PENDING - ACCOUNT CREDENTIALS
======================================
Username: ${user?.username || 'unknown'}
Created: ${new Date().toISOString()}

IMPORTANT: There is NO password recovery.
Store these credentials safely!

This is your only way to access your account.
======================================`;

    try {
      if (Platform.OS === 'ios') {
        // On iOS, use the share sheet
        await Share.share({
          message: credentials,
          title: 'Survival Pending Credentials',
        });
        setCredentialsDownloaded(true);
      } else {
        // On Android, use share as well
        await Share.share({
          message: credentials,
          title: 'Survival Pending Credentials',
        });
        setCredentialsDownloaded(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save credentials. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="h2" align="center" style={styles.title}>
          Save Your Credentials
        </Text>

        <Text variant="body" color="muted" align="center" style={styles.description}>
          There is no password recovery. These credentials are your only way back in.
        </Text>

        <Card style={[styles.credentialsCard, { backgroundColor: colors.secondary }]}>
          <CardContent>
            <Text variant="caption" weight="semibold" style={styles.label}>
              Username
            </Text>
            <Text variant="h5" style={styles.username}>
              {user?.username || 'Loading...'}
            </Text>
            
            <Text variant="caption" color="muted" style={styles.hint}>
              Your password is what you just created
            </Text>
          </CardContent>
        </Card>

        <Button
          onPress={downloadCredentials}
          size="lg"
          fullWidth
          variant={credentialsDownloaded ? 'secondary' : 'default'}
        >
          {credentialsDownloaded ? '✓ Downloaded' : 'Download Credentials'}
        </Button>

        {credentialsDownloaded && (
          <Text variant="caption" color="muted" align="center" style={styles.confirmation}>
            Great! Your credentials have been saved. Keep them somewhere safe.
          </Text>
        )}

        <View style={[styles.warningBox, { backgroundColor: colors.destructive + '10' }]}>
          <Text variant="caption" weight="semibold" style={{ color: colors.destructive }}>
            ⚠️ Final Warning
          </Text>
          <Text variant="caption" color="muted" style={styles.warningText}>
            If you lose these credentials, you will lose access to your account forever. 
            There is no email recovery, no support team that can help. This is by design to protect your anonymity.
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
  credentialsCard: {
    width: '100%',
    marginBottom: spacing[6],
  },
  label: {
    marginBottom: spacing[1],
  },
  username: {
    fontFamily: getFontFamily('mono'),
    marginBottom: spacing[3],
  },
  hint: {
    fontStyle: 'italic',
  },
  confirmation: {
    marginTop: spacing[4],
    maxWidth: 280,
  },
  warningBox: {
    marginTop: spacing[8],
    padding: spacing[4],
    borderRadius: radius.md,
    width: '100%',
  },
  warningText: {
    marginTop: spacing[2],
    lineHeight: 20,
  },
});