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
import { RefreshCw, Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const isDevelopment = process.env.NODE_ENV === 'development';

export default function SignupForm() {
  const { signup } = useAuth();
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

  useEffect(() => {
    fetchUsernames();
  }, []);

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

    if (!turnstileToken) {
      setError('Please complete the verification');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await signup(selectedUsername, password, turnstileToken);
      toast.success('Account created! Welcome to Survival Pending.');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Create Your Account</CardTitle>
        <CardDescription className="text-center">
          Choose an anonymous username to protect your identity
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Choose Your Username</Label>
            {loadingUsernames ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <>
                <RadioGroup value={selectedUsername} onValueChange={setSelectedUsername}>
                  {usernames.map((username) => (
                    <div key={username} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                      <RadioGroupItem value={username} id={username} />
                      <Label 
                        htmlFor={username} 
                        className="flex-1 cursor-pointer font-mono text-sm"
                      >
                        {username}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={fetchUsernames}
                  className="w-full mt-2"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Show different options
                </Button>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="At least 8 characters"
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
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
                sitekey="0x4AAAAAABjlVsWX1T32zuBH"
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

        <CardFooter className="flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !turnstileToken}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Important:</strong> Your username and password are the only way to access your account. 
              We cannot recover them. Please save them securely.
            </AlertDescription>
          </Alert>
        </CardFooter>
      </form>
    </Card>
  );
}