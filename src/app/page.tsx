// src/app/page.tsx
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogoIcon } from '@/components/icons/logo-icon';
import { AuthButton } from '@/components/auth/auth-button';
import {
  ArrowRight,
  BarChart,
  Zap,
  ShieldCheck,
  Brain,
  Globe,
  CheckCircle,
  Sparkles,
  Target,
  TrendingUp,
  Download,
  Clock,
  Users,
  Star,
  Database,
  Cpu,
  Shield,
  Rocket,
  Award,
  Play,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/auth/signin');
    }
  };

  // Scroll animation logic
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, observerOptions);

    // Observe all elements with scroll animation classes
    const animateElements = document.querySelectorAll('.scroll-animate, .slide-up-animate, .slide-left, .slide-right, .scale-in');
    animateElements.forEach((el) => observer.observe(el));

    return () => {
      animateElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Modern Header with Glass Effect */}
      <header className="sticky top-0 z-50 w-full glass border-b border-white/20 backdrop-blur-xl">
        <div className="container flex h-20 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <LogoIcon className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CortexCrawler
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="nav-link">Features</Link>
            <Link href="#how-it-works" className="nav-link">How it Works</Link>
            <Link href="#pricing" className="nav-link">Pricing</Link>
            <Link href="#testimonials" className="nav-link">Testimonials</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <AuthButton />
            {!user && !authLoading && (
              <Button asChild className="btn-primary hidden sm:flex">
                <Link href="/auth/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 lg:py-40 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>

          {/* Subtle Brand Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-purple-600/10 to-blue-800/15 opacity-80"></div>

          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-5xl mx-auto fade-in">
              <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200 hero-text">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Web Scraping Platform
              </Badge>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 hero-heading">
                Extract Web Data with
                <span className="block gradient-text mt-2">
                  Intelligent Precision
                </span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed hero-description">
                Transform any website into structured data using advanced AI.
                No coding required, no brittle selectors, just intelligent extraction that adapts to any site.
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="text-lg px-8 py-4 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Brain className="mr-2 h-5 w-5" />
                  Start Extracting Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="text-lg px-8 py-4 h-14 border-2 border-gray-300 hover:bg-gray-50 hover:border-blue-300"
                >
                  <Link href="#demo">
                    <Play className="mr-2 h-5 w-5" />
                    Watch Demo
                  </Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Free tier available</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Setup in 30 seconds</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 md:py-20 bg-white border-y border-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Trusted by Data Teams Worldwide
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join thousands of professionals who rely on CortexCrawler for their data extraction needs
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
                <div className="stat-card text-center scroll-animate scroll-animate-delay-1">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">50K+</div>
                  <div className="text-sm text-gray-600">URLs Processed</div>
                </div>
                <div className="stat-card text-center scroll-animate scroll-animate-delay-2">
                  <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="stat-card text-center scroll-animate scroll-animate-delay-3">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">2K+</div>
                  <div className="text-sm text-gray-600">Happy Users</div>
                </div>
                <div className="stat-card text-center scroll-animate scroll-animate-delay-4">
                  <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">24/7</div>
                  <div className="text-sm text-gray-600">Support</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 slide-up-animate">
              <Badge variant="outline" className="mb-4 px-4 py-2 bg-white mx-auto">
                <Target className="w-4 h-4 mr-2" />
                Core Features
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Everything you need to extract web data
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Powerful AI-driven features designed to make web scraping effortless, accurate, and scalable
              </p>
            </div>
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              <div className="feature-card group scroll-animate scroll-animate-delay-1">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl mr-4 group-hover:from-blue-500/20 group-hover:to-blue-500/10 transition-all duration-300">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">AI-Powered Extraction</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Our advanced AI automatically identifies and extracts relevant content from any webpage,
                  eliminating the need for fragile CSS selectors or complex configurations.
                </p>
              </div>

              <div className="feature-card group scroll-animate scroll-animate-delay-2">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl mr-4 group-hover:from-purple-500/20 group-hover:to-purple-500/10 transition-all duration-300">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Intelligent Summaries</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Get instant AI-generated summaries of extracted content, helping you quickly understand
                  and process large amounts of data without manual review.
                </p>
              </div>

              <div className="feature-card group scroll-animate scroll-animate-delay-3">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl mr-4 group-hover:from-green-500/20 group-hover:to-green-500/10 transition-all duration-300">
                    <Download className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Multiple Export Formats</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Export your extracted data in JSON, CSV, or Excel formats. Perfect for analysis,
                  reporting, or integration with your existing data workflows.
                </p>
              </div>

              <div className="feature-card group scroll-animate scroll-animate-delay-4">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-xl mr-4 group-hover:from-orange-500/20 group-hover:to-orange-500/10 transition-all duration-300">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Scheduled Extraction</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Set up automated scraping schedules to keep your data fresh. Daily, weekly, or monthly -
                  your data stays current without manual intervention.
                </p>
              </div>

              <div className="feature-card group scroll-animate scroll-animate-delay-5">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-xl mr-4 group-hover:from-red-500/20 group-hover:to-red-500/10 transition-all duration-300">
                    <Shield className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Enterprise Security</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Built on Firebase with enterprise-grade security. Your data and scraping operations
                  are protected with industry-standard encryption and authentication.
                </p>
              </div>

              <div className="feature-card group scroll-animate scroll-animate-delay-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 rounded-xl mr-4 group-hover:from-indigo-500/20 group-hover:to-indigo-500/10 transition-all duration-300">
                    <TrendingUp className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Scalable Infrastructure</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  From single page extractions to large-scale data operations, our infrastructure
                  scales with your needs while maintaining consistent performance.
                </p>
              </div>
            </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 px-4 py-2 mx-auto">
                <Rocket className="w-4 h-4 mr-2" />
                How It Works
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Extract data in 3 simple steps
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our AI-powered platform makes web scraping accessible to everyone, from beginners to experts
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                <div className="text-center group">
                  <div className="relative mb-6 flex justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <span className="text-2xl font-bold text-white">1</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                      <Globe className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Enter URL</h3>
                  <p className="text-gray-600 max-w-sm mx-auto">
                    Simply paste the URL of the website you want to scrape. Our AI will analyze the page structure automatically.
                  </p>
                </div>

                <div className="text-center group">
                  <div className="relative mb-6 flex justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <span className="text-2xl font-bold text-white">2</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                      <Brain className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Extraction</h3>
                  <p className="text-gray-600 max-w-sm mx-auto">
                    Our advanced AI identifies and extracts the relevant data, understanding context and structure without manual configuration.
                  </p>
                </div>

                <div className="text-center group">
                  <div className="relative mb-6 flex justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <span className="text-2xl font-bold text-white">3</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                      <Download className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Export Data</h3>
                  <p className="text-gray-600 max-w-sm mx-auto">
                    Download your structured data in your preferred format: JSON, CSV, or Excel. Ready for analysis or integration.
                  </p>
                </div>
            </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 md:py-28 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 slide-up-animate">
              <Badge variant="outline" className="mb-4 px-4 py-2 mx-auto">
                <TrendingUp className="w-4 h-4 mr-2" />
                Pricing Plans
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Choose the perfect plan for your needs
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Start free and scale as you grow. All plans include our core AI-powered extraction features.
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                {/* Free Tier */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 relative scale-in scroll-animate-delay-1">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">$0</span>
                      <span className="text-gray-600 ml-2">forever</span>
                    </div>
                    <p className="text-gray-600">Perfect for getting started</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">100 extractions per month</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Basic AI extraction</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">JSON & CSV export</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Community support</span>
                    </li>
                  </ul>

                  <Button
                    className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white"
                    onClick={handleGetStarted}
                  >
                    Get Started Free
                  </Button>
                </div>

                {/* Pro Tier - Most Popular */}
                <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-500 p-8 relative transform scale-105 scale-in scroll-animate-delay-2">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">$29</span>
                      <span className="text-gray-600 ml-2">per month</span>
                    </div>
                    <p className="text-gray-600">For growing businesses</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">10,000 extractions per month</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Advanced AI extraction</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">All export formats</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Scheduled extractions</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Priority support</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">API access</span>
                    </li>
                  </ul>

                  <Button
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    onClick={handleGetStarted}
                  >
                    Start Pro Trial
                  </Button>
                </div>

                {/* Enterprise Tier */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 relative scale-in scroll-animate-delay-3">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">Custom</span>
                    </div>
                    <p className="text-gray-600">For large organizations</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Unlimited extractions</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Custom AI models</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">White-label solution</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Dedicated support</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">SLA guarantee</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">On-premise deployment</span>
                    </li>
                  </ul>

                  <Button
                    variant="outline"
                    className="w-full h-12 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
                  >
                    Contact Sales
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 slide-up-animate">
              <Badge variant="outline" className="mb-4 px-4 py-2 mx-auto">
                <Users className="w-4 h-4 mr-2" />
                Customer Stories
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Trusted by data teams worldwide
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                See how companies are transforming their data workflows with CortexCrawler
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Testimonial 1 */}
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 testimonial-card slide-left scroll-animate-delay-1">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-6 leading-relaxed">
                    "CortexCrawler has revolutionized our market research process. What used to take our team days now takes minutes. The AI extraction is incredibly accurate."
                  </blockquote>
                  <div className="flex items-center">
                    <img
                      src="https://randomuser.me/api/portraits/women/44.jpg"
                      alt="Sarah Chen profile picture"
                      className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-white shadow-sm"
                      onError={(e) => {
                        e.currentTarget.src = "https://ui-avatars.com/api/?name=Sarah+Chen&background=3F51B5&color=fff&size=48";
                      }}
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Sarah Chen</div>
                      <div className="text-sm text-gray-600">Data Scientist, TechFlow Inc</div>
                    </div>
                  </div>
                </div>

                {/* Testimonial 2 */}
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 testimonial-card scroll-animate scroll-animate-delay-2">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-6 leading-relaxed">
                    "The scheduled extraction feature is a game-changer. Our competitive analysis reports are now automated and always up-to-date. Highly recommend!"
                  </blockquote>
                  <div className="flex items-center">
                    <img
                      src="https://randomuser.me/api/portraits/men/32.jpg"
                      alt="Mike Johnson profile picture"
                      className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-white shadow-sm"
                      onError={(e) => {
                        e.currentTarget.src = "https://ui-avatars.com/api/?name=Mike+Johnson&background=10B981&color=fff&size=48";
                      }}
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Mike Johnson</div>
                      <div className="text-sm text-gray-600">Marketing Director, DataFlow</div>
                    </div>
                  </div>
                </div>

                {/* Testimonial 3 */}
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 testimonial-card slide-right scroll-animate-delay-3 md:col-span-2 lg:col-span-1">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-6 leading-relaxed">
                    "Enterprise-grade security with incredible ease of use. CortexCrawler handles our large-scale data extraction needs flawlessly."
                  </blockquote>
                  <div className="flex items-center">
                    <img
                      src="https://randomuser.me/api/portraits/men/17.jpg"
                      alt="Alex Rodriguez profile picture"
                      className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-white shadow-sm"
                      onError={(e) => {
                        e.currentTarget.src = "https://ui-avatars.com/api/?name=Alex+Rodriguez&background=8B5CF6&color=fff&size=48";
                      }}
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Alex Rodriguez</div>
                      <div className="text-sm text-gray-600">CTO, Enterprise Solutions</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Logos */}
              <div className="mt-16 pt-12 border-t border-gray-200">
                <p className="text-center text-gray-500 mb-8 font-medium">Trusted by leading companies</p>
                <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 opacity-60">
                  <div className="text-2xl font-bold text-gray-400">TechFlow</div>
                  <div className="text-2xl font-bold text-gray-400">DataFlow</div>
                  <div className="text-2xl font-bold text-gray-400">Enterprise Solutions</div>
                  <div className="text-2xl font-bold text-gray-400">InnovateCorp</div>
                  <div className="text-2xl font-bold text-gray-400">ScaleUp</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center slide-up-animate">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Data Workflow?
              </h2>
              <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of professionals who trust CortexCrawler for their web scraping needs.
                Start extracting data in minutes, not hours.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="text-lg px-8 py-4 h-14 bg-white text-blue-600 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4 h-14 border-2 border-white text-white hover:bg-white hover:text-blue-600"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                  <LogoIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">CortexCrawler</span>
              </Link>
              <p className="text-gray-400 mb-4 max-w-md">
                The most advanced AI-powered web scraping platform. Extract data from any website with intelligent precision.
              </p>
              <div className="flex space-x-4">
                <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                  <Award className="w-3 h-3 mr-1" />
                  Enterprise Ready
                </Badge>
                <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                  <Shield className="w-3 h-3 mr-1" />
                  SOC 2 Compliant
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#api" className="hover:text-white transition-colors">API</Link></li>
                <li><Link href="#integrations" className="hover:text-white transition-colors">Integrations</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} CortexCrawler. All rights reserved. Built with ❤️ for data teams worldwide.</p>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
