'use client';

import { useState, useEffect } from 'react';
import { signInAdmin } from '@/actions/auth';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    // This ensures the form fields are set correctly when mounted on the client side
    setEmail('');
    setPassword('');
  }, []); // Empty dependency array ensures this runs only on the client side

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const result = await signInAdmin(email, password);

    if (result.success) {
      setMessage({
        type: 'success',
        text: result.message || 'Sign in successful! Redirecting...',
      });
      setEmail('');
      setPassword('');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } else {
      setMessage({
        type: 'error',
        text: result.error || 'An error occurred during sign in',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg border border-border shadow-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground text-balance">
              Admin Login
            </h1>
            <p className="text-muted-foreground mt-2">
              Sign in to your admin account to continue
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-md ${
                message.type === 'error'
                  ? 'bg-destructive/10 text-destructive border border-destructive/20'
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <a href="#" className="text-primary hover:underline font-medium">
                Contact administrator
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
