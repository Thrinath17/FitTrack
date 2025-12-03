import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { AuthProvider } from '../../types';
import { Apple, Mail } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (provider: AuthProvider, email?: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialLogin = async (provider: AuthProvider) => {
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      onLogin(provider);
      setIsLoading(false);
    }, 1500);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setTimeout(() => {
      onLogin(AuthProvider.EMAIL, email);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">FitTrack Pro</h2>
          <p className="mt-2 text-sm text-slate-600">
            Your personal workout attendance assistant
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-surface py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-100">
            {!isEmailMode ? (
              <div className="space-y-4">
                <Button 
                  fullWidth 
                  variant="secondary" 
                  onClick={() => handleSocialLogin(AuthProvider.GOOGLE)}
                  isLoading={isLoading}
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 mr-2" alt="Google" />
                  Sign in with Google
                </Button>

                <Button 
                  fullWidth 
                  variant="secondary"
                  onClick={() => handleSocialLogin(AuthProvider.APPLE)}
                  isLoading={isLoading}
                >
                  <Apple className="w-5 h-5 mr-2" />
                  Sign in with Apple
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">Or continue with</span>
                  </div>
                </div>

                <Button 
                  fullWidth 
                  variant="primary"
                  onClick={() => setIsEmailMode(true)}
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Sign in with Email
                </Button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleEmailLogin}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                   <button type="button" onClick={() => setIsEmailMode(false)} className="text-sm text-primary hover:text-indigo-500">
                     Back to Social
                   </button>
                   <div className="text-sm">
                    <a href="#" className="font-medium text-primary hover:text-indigo-500">
                      Forgot password?
                    </a>
                  </div>
                </div>

                <Button type="submit" fullWidth isLoading={isLoading}>
                  Sign In
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};