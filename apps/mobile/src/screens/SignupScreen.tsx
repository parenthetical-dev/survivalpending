import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '../types/auth';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Input, Text } from '../components/ui';
import { spacing, radius } from '../utils/theme';
import { getFontFamily } from '../utils/fonts';
import { authApi } from '../api/auth';
import { STORAGE_KEYS } from '../config/api';
import * as SecureStore from 'expo-secure-store';

export function SignupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { signup } = useAuth();
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingUsername, setIsGeneratingUsername] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const username = watch('username');

  // Generate username on mount
  useEffect(() => {
    generateUsername();
  }, []);

  const generateUsername = async () => {
    setIsGeneratingUsername(true);
    try {
      const newUsername = await authApi.generateUsername();
      setValue('username', newUsername);
    } catch (error) {
      console.error('Failed to generate username:', error);
    } finally {
      setIsGeneratingUsername(false);
    }
  };

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    try {
      await signup(data);
      // Mark that credentials need to be downloaded
      await SecureStore.setItemAsync(STORAGE_KEYS.CREDENTIALS_DOWNLOADED, 'false');
      // Navigate to onboarding
      navigation.reset({
        index: 0,
        routes: [{ name: 'Onboarding' as any }],
      });
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Text variant="h2" align="center" style={styles.title}>
            Create Your Account
          </Text>
          <Text variant="body" color="muted" align="center" style={styles.subtitle}>
            Your anonymous identity awaits
          </Text>

          <View style={styles.inputs}>
            <View style={styles.usernameContainer}>
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Your anonymous username"
                    placeholder="Loading..."
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={false}
                    error={errors.username?.message}
                    style={styles.usernameInput}
                  />
                )}
              />
              <TouchableOpacity
                onPress={generateUsername}
                disabled={isGeneratingUsername}
                style={[styles.regenerateButton, { backgroundColor: colors.secondary }]}
              >
                <Text variant="body" weight="medium">
                  {isGeneratingUsername ? '...' : '↻'}
                </Text>
              </TouchableOpacity>
            </View>

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Create a password"
                  placeholder="Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry={!showPassword}
                  autoComplete="password-new"
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirm your password"
                  placeholder="Confirm password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry={!showPassword}
                  autoComplete="password-new"
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.showPasswordButton}
            >
              <Text variant="caption" color="muted">
                {showPassword ? 'Hide' : 'Show'} passwords
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.requirements, { backgroundColor: colors.muted }]}>
            <Text variant="caption" weight="medium" style={styles.requirementsTitle}>
              Password Requirements:
            </Text>
            <Text variant="caption" color="muted">
              • At least 8 characters
            </Text>
            <Text variant="caption" color="muted">
              • One uppercase letter
            </Text>
            <Text variant="caption" color="muted">
              • One number
            </Text>
            <Text variant="caption" color="muted">
              • One special character
            </Text>
          </View>

          <Button
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            fullWidth
            size="lg"
            disabled={!username || isGeneratingUsername}
          >
            Create Account
          </Button>

          <View style={styles.footer}>
            <Text variant="body" color="muted">
              Already have an account?{' '}
            </Text>
            <Button variant="link" onPress={() => navigation.navigate('Login' as any)}>
              <Text variant="body" weight="semibold" style={{ textDecorationLine: 'underline' }}>
                Sign in
              </Text>
            </Button>
          </View>

          <View style={[styles.warningBox, { backgroundColor: colors.destructive + '10', borderColor: colors.destructive }]}>
            <Text variant="caption" weight="semibold" style={{ color: colors.destructive }}>
              ⚠️ Important
            </Text>
            <Text variant="caption" color="muted" style={styles.warningText}>
              There is no password recovery. Store your credentials safely - losing them means losing access forever.
            </Text>
          </View>
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing[5],
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    marginBottom: spacing[2],
  },
  subtitle: {
    marginBottom: spacing[8],
  },
  inputs: {
    marginBottom: spacing[4],
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[2],
  },
  usernameInput: {
    fontFamily: getFontFamily('mono'),
    flex: 1,
  },
  regenerateButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  showPasswordButton: {
    alignSelf: 'flex-end',
    padding: spacing[2],
    marginTop: -spacing[2],
  },
  requirements: {
    padding: spacing[4],
    borderRadius: radius.md,
    marginBottom: spacing[6],
  },
  requirementsTitle: {
    marginBottom: spacing[2],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[6],
  },
  warningBox: {
    marginTop: spacing[6],
    padding: spacing[4],
    borderRadius: radius.md,
    borderWidth: 1,
  },
  warningText: {
    marginTop: spacing[1],
    lineHeight: 18,
  },
});