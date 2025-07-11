import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '../types/auth';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Input, Text } from '../components/ui';
import { spacing } from '../utils/theme';
import { getFontFamily } from '../utils/fonts';

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { login } = useAuth();
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      await login(data);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Sign In Failed', error.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignup = () => {
    navigation.navigate('Signup' as any);
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
            Welcome Back
          </Text>
          <Text variant="body" color="muted" align="center" style={styles.subtitle}>
            Sign in with your anonymous credentials
          </Text>

          <View style={styles.inputs}>
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Username"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username"
                  error={errors.username?.message}
                  style={styles.usernameInput}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  autoComplete="password"
                  error={errors.password?.message}
                />
              )}
            />
          </View>

          <Button
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            fullWidth
            size="lg"
          >
            Sign In
          </Button>

          <View style={styles.footer}>
            <Text variant="body" color="muted">
              Don't have an account?{' '}
            </Text>
            <Button variant="link" onPress={navigateToSignup}>
              <Text variant="body" weight="semibold" style={{ textDecorationLine: 'underline' }}>
                Create one
              </Text>
            </Button>
          </View>

          <Text variant="caption" color="muted" align="center" style={styles.safetyText}>
            Your identity is protected. We never collect emails or personal information.
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
    marginBottom: spacing[6],
  },
  usernameInput: {
    fontFamily: getFontFamily('mono'),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[6],
  },
  safetyText: {
    marginTop: spacing[8],
    lineHeight: 18,
  },
});