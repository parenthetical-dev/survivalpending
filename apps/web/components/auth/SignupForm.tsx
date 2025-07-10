'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Turnstile } from '@marsidev/react-turnstile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Shield, Eye, EyeOff, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { trackEvent } from '@/lib/analytics';

export default function SignupForm() {
  const { signup } = useAuth();
  // Only bypass in development with explicit env var
  const isDevelopment = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ALLOW_DEV_BYPASS === 'true';
  const [usernames, setUsernames] = useState<string[]>([]);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(isDevelopment ? 'development-token' : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingUsernames, setLoadingUsernames] = useState(true);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    fetchUsernames();
  }, []);

  useEffect(() => {
    // Check password requirements
    setPasswordRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  const fetchUsernames = async () => {
    setLoadingUsernames(true);
    try {
      const response = await fetch('/api/auth/signup');
      const data = await response.json();
      setUsernames(data.usernames);
      setSelectedUsername(data.usernames[0]);
    } catch (err) {
      setError('Failed to generate usernames');
      toast.error('Failed to generate usernames. Please try again.');
    } finally {
      setLoadingUsernames(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Track signup attempt
    trackEvent('SIGNUP_START', 'USER', {
      hasUsername: !!selectedUsername,
    });

    if (!turnstileToken) {
      setError('Please complete the verification');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password requirements
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!hasUppercase) {
      setError('Password must contain at least one uppercase letter');
      return;
    }

    if (!hasNumber) {
      setError('Password must contain at least one number');
      return;
    }

    if (!hasSpecial) {
      setError('Password must contain at least one special character');
      return;
    }

    setLoading(true);
    try {
      await signup(selectedUsername, password, turnstileToken);

      // Track successful signup
      trackEvent('SIGNUP_COMPLETE', 'USER', {
        usernameGenerated: true,
      });

      toast.success('Account created! Welcome to Survival Pending.');
    } catch (err: any) {
      setError(err.message);

      // Track signup failure
      trackEvent('SIGNUP_FAILED', 'USER', {
        error: err.message,
      });

      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 pb-4 md:pb-6">
        <CardTitle className="text-xl md:text-2xl font-bold text-center">Create Your Account</CardTitle>
        <CardDescription className="text-center text-sm md:text-base">
          Choose an anonymous username to protect your identity
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-3 md:space-y-4 pt-0">
          <div className="space-y-2">
            <Label htmlFor="username">Your Username</Label>
            {loadingUsernames ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <div className="flex gap-2">
                <Input
                  id="username"
                  value={selectedUsername}
                  disabled
                  className="flex-1 font-mono text-sm bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    trackEvent('USERNAME_REGENERATED', 'USER');
                    fetchUsernames();
                  }}
                  className="h-10 w-10"
                  title="Get new username"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              This anonymous username will be your only identifier
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Create a strong password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {password && (
              <div className="mt-2 space-y-1 text-xs">
                <div className={`flex items-center gap-1 ${passwordRequirements.length ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                  {passwordRequirements.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>At least 8 characters</span>
                </div>
                <div className={`flex items-center gap-1 ${passwordRequirements.uppercase ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                  {passwordRequirements.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>One uppercase letter</span>
                </div>
                <div className={`flex items-center gap-1 ${passwordRequirements.number ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                  {passwordRequirements.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>One number</span>
                </div>
                <div className={`flex items-center gap-1 ${passwordRequirements.special ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                  {passwordRequirements.special ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>One special character (!@#$%^&*)</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Confirm your password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {isDevelopment ? (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertDescription className="text-sm text-yellow-800">
                Development mode: Captcha bypassed
              </AlertDescription>
            </Alert>
          ) : (
            <div className="flex justify-center pt-2">
              <Turnstile
                siteKey="0x4AAAAAABjlVsWX1T32zuBH"
                onSuccess={(token) => setTurnstileToken(token)}
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex-col space-y-3 md:space-y-4 pt-4 md:pt-6">
          <Button
            type="submit"
            className="w-full"
            size="default"
            disabled={loading || !turnstileToken}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <Alert className="py-3">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-xs md:text-sm ml-1">
              <strong>Important:</strong> Your username and password are the only way to access your account.
              We cannot recover them. Please save them securely.
            </AlertDescription>
          </Alert>
        </CardFooter>
      </form>
    </Card>
  );
}