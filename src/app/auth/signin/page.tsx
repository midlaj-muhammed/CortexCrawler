// src/app/auth/signin/page.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignInForm } from '@/components/auth/signin-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogoIcon } from '@/components/icons/logo-icon';
import { useAuth } from '@/contexts/auth-context';
import { useEffect } from 'react';
import {
  ChromeIcon,
  Shield,
  Zap,
  Brain,
  CheckCircle,
  Star,
  Users,
  TrendingUp,
  Globe
} from 'lucide-react';

export default function SignInPage() {
  const { user, signInWithGoogle, loading, error, clearError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    // Clear previous errors when the component mounts or when user changes
    clearError();
  }, [clearError]);


  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
    // Navigation is handled by signInWithGoogle in AuthContext if successful
  };

  return (
    <>
      <div className="min-h-screen flex">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 p-12 flex-col justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center space-x-3 mb-12">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <LogoIcon className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">CortexCrawler</span>
          </Link>

          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome back to the future of web scraping
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Join thousands of professionals who trust CortexCrawler for intelligent data extraction.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">AI-Powered Extraction</h3>
                <p className="text-blue-100">Advanced AI automatically identifies and extracts relevant content</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Enterprise Security</h3>
                <p className="text-blue-100">Bank-level security with SOC 2 compliance and encryption</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Lightning Fast</h3>
                <p className="text-blue-100">Extract data in seconds, not hours with our optimized infrastructure</p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/10 rounded-xl backdrop-blur-sm">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-red-400 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-teal-400 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
              </div>
            </div>
            <p className="text-white font-medium mb-2">"CortexCrawler transformed our data collection process"</p>
            <p className="text-blue-100 text-sm">Sarah Chen, Data Scientist at TechCorp</p>
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-12 bg-white">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="flex items-center justify-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <LogoIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CortexCrawler
              </span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
            <p className="text-gray-600">Sign in to access your dashboard and continue extracting data.</p>
          </div>

          <div className="space-y-6">
            <SignInForm />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                minHeight: '48px',
                fontWeight: '600',
                zIndex: 100
              }}
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <ChromeIcon className="mr-2 h-5 w-5" />
              )}
              Sign in with Google
            </Button>

            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up for free
              </Link>
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>2K+ Users</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-4 w-4" />
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center space-x-1">
              <Globe className="h-4 w-4" />
              <span>50K+ URLs</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
