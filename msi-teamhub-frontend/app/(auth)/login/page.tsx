'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  GitBranch,
  FileText,
  DollarSign,
  Calendar,
  Zap,
  Package,
  Lightbulb,
  TrendingUp,
  LucideIcon,
} from 'lucide-react';

// ✅ FIX 1: Define icon map at module level to avoid hydration issues
const ICON_MAP: Record<string, LucideIcon> = {
  GitBranch,
  FileText,
  DollarSign,
  Calendar,
  Package,
  Lightbulb,
  TrendingUp,
  Zap,
};

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) throw new Error('Invalid credentials');

      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      if (data.refresh) localStorage.setItem('refresh_token', data.refresh);

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FIX 2: Use string keys instead of component references
  const features = [
    { icon: 'GitBranch', title: 'Organizational Chart', desc: 'Hierarchical team structure & reporting' },
    { icon: 'FileText', title: 'Job Descriptions', desc: 'Comprehensive role documentation' },
    { icon: 'DollarSign', title: 'Payroll Management', desc: 'Automated salary & compensation' },
    { icon: 'Calendar', title: 'Leave Management', desc: 'Time-off requests & approvals' },
    { icon: 'Package', title: 'Equipment Tracking', desc: 'Asset & resource management' },
    { icon: 'Lightbulb', title: 'Suggestions & Feedback', desc: 'Employee engagement & ideas' },
    { icon: 'TrendingUp', title: 'Real-Time Dashboards', desc: 'Live HR analytics & insights' },
    { icon: 'Zap', title: 'Performance Optimization', desc: 'Continuous improvement tools' },
  ];

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#0B1120]"
      suppressHydrationWarning
    >
      {/* Tech Grid Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-[100px] animate-pulse delay-500" />

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10 px-4 lg:px-0">
        {/* Left Side: Branding & Features */}
        <div className="hidden lg:flex flex-col space-y-8 pr-12 animate-in slide-in-from-left-8 duration-700">
          {/* MSI TeamHub Logo (bigger) */}
          <div className="flex items-center gap-5 group cursor-pointer">
            <div className="relative h-20 w-20 bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/40 group-hover:shadow-3xl group-hover:shadow-blue-500/60 transition-all duration-300 transform group-hover:scale-110">
              <span className="text-5xl font-black text-white drop-shadow-lg">M</span>
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 tracking-tight">
                MSI
              </span>
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">TeamHub</span>
            </div>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-white tracking-tight leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-500">Empower</span> Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-500">Team</span>,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Accelerate</span> Growth.
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-lg font-light">
              Complete HR management platform for modern enterprises. Streamline operations, empower employees, and drive growth.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            {features.map((feature, idx) => {
              // ✅ FIX 3: Safely get icon component from map
              const IconComponent = ICON_MAP[feature.icon];
              return (
                <div key={idx} className="group hover:translate-y-1 transition-transform cursor-pointer">
                  <div className="flex items-start gap-3 p-4 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                      {IconComponent ? <IconComponent className="w-5 h-5 text-blue-400" /> : null}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white leading-tight">{feature.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 pt-6 border-t border-slate-800/50">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-11 h-11 rounded-full border-2 border-[#0B1120] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs text-white font-bold shadow-lg hover:scale-110 transition-transform cursor-pointer"
                >
                  U{i}
                </div>
              ))}
            </div>
            <div className="text-sm text-slate-300">
              <span className="text-white font-bold text-xl">2,000+</span>
              <p className="text-xs text-slate-400">employees managed</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full max-w-md animate-in slide-in-from-right-8 duration-700">
          <Card className="bg-slate-900/80 border-slate-700/50 shadow-2xl">
            <div className="p-8 lg:p-10">
              {/* Card Header */}
              <div className="mb-8 text-center">
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-sm text-slate-400">Sign in to your MSI TeamHub account</p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-800/50">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300">{error}</AlertDescription>
                </Alert>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-7">
                {/* Username/Email Field - ✅ FIXED: Changed from type="email" to type="text" */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">Username or Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-4 h-6 w-6 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      type="text"
                      placeholder="Enter username or email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                      className="pl-14 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-500 h-12 focus:border-blue-500 focus:ring-blue-500/30"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-4 h-6 w-6 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="pl-14 pr-12 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-500 h-12 focus:border-blue-500 focus:ring-blue-500/30"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-4 text-slate-500 hover:text-slate-300 transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !username || !password}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              {/* Security Features */}
              <div className="mt-8 pt-6 border-t border-slate-800/50 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="text-sm">
                    <h4 className="text-white font-semibold">Enterprise Security</h4>
                    <p className="text-xs text-slate-400 mt-0.5">End-to-end encrypted connections</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6 text-xs text-slate-500">
            <p>© 2025-2026 MSI TeamHub. Enterprise Edition.</p>
          </div>
        </div>
      </div>
    </div>
  );
}