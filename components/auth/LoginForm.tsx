'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Turnstile } from '@marsidev/react-turnstile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

const isDevelopment = process.env.NODE_ENV === 'development';

export default function LoginForm() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(isDevelopment ? 'development-token' : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!turnstileToken) {
      setError('Please complete the verification');
      return;
    }

    setLoading(true);
    try {
      await login(username, password, turnstileToken);
      toast.success('Welcome back! You\'ve successfully logged in.');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 pb-4 md:pb-6">
        <CardTitle className="text-xl md:text-2xl font-bold text-center">Welcome Back</CardTitle>
        <CardDescription className="text-center text-sm md:text-base">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-3 md:space-y-4 pt-0">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_anonymous_username"
              className="font-mono"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your secure password"
                required
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
            {loading ? 'Logging in...' : 'Log In'}
          </Button>

          <Alert className="py-3">
            <KeyRound className="h-4 w-4" />
            <AlertDescription className="text-xs md:text-sm ml-1">
              <strong>Remember:</strong> Your username and password cannot be recovered. 
              Keep them safe.
            </AlertDescription>
          </Alert>
        </CardFooter>
      </form>
    </Card>
  );
}