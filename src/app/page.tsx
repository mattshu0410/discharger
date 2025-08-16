'use client';

import { ArrowRight, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DemoSection from '@/components/DemoSection';
import TimeSavedCalculator from '@/components/TimeSavedCalculator';
import { Button } from '@/components/ui/button';
import CustomCursor from '@/components/ui/CustomCursor';

export default function AutoDischargeLandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-x-hidden w-full">
      <CustomCursor />
      <section className="h-screen flex flex-col">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 w-full flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                    Discharger
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Link href="/simplifier">
                  <Button variant="ghost" size="sm" className="text-gray-900 hover:border-gray-900">
                    Patient Simplifier
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm" className="text-gray-900 hover:border-gray-900">
                    Sign In
                  </Button>
                </Link>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white"
                  onClick={() => router.push('/discharge')}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative overflow-hidden flex-1 flex flex-col pt-20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-primary-100/30" />
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col pt-8">
            <div className="text-center flex-shrink-0">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 mb-6">
                <FileText className="w-4 h-4 mr-2" />
                AI-Powered Clinical Documentation
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Discharge in
                {' '}
                <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                  a Click
                </span>
              </h1>

              <div>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  Transform your clinical notes into professional discharge summaries instantly.
                  Powered by AI and backed by medical guidelines you can trust.
                </p>

                <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white px-12 py-4 text-lg"
                    onClick={() => router.push('/discharge')}
                  >
                    Try It Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Demo Section */}
            <div className="flex-1 min-h-0">
              <DemoSection />
            </div>
          </div>
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Built for healthcare professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create accurate, comprehensive discharge summaries efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* HIPAA Compliant */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="bg-primary-500/40 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <div className="rounded-2xl h-80 flex items-center justify-center w-full p-6">
                    <img
                      src="/assets/images/previewHippa.png"
                      alt="HIPAA compliance interface"
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">HIPAA Compliant</h3>
              <p className="text-gray-600">
                Safeguards sensitive patient information with enterprise-grade security and compliance standards
              </p>
            </div>

            {/* Learns Your Style */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="bg-primary-500/40 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <div className="rounded-2xl h-80 flex items-center justify-center w-full p-6">
                    <img
                      src="/assets/images/previewFeedback.png"
                      alt="AI feedback learning interface"
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Learns Your Style</h3>
              <p className="text-gray-600">
                Every time you provide feedback, Discharger learns your preferences and writing style
              </p>
            </div>

            {/* Verifiable Citations */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="bg-primary-500/40 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <div className="rounded-2xl h-80 flex items-center justify-center w-full p-6">
                    <img
                      src="/assets/images/previewCitation.png"
                      alt="Medical citations interface"
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verifiable Citations</h3>
              <p className="text-gray-600">
                Understand exactly where AI got its information from with medical guideline citations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Time Saved Calculator */}
      <TimeSavedCalculator />

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-800 py-8 text-center">
            <p className="text-gray-400">
              © 2025 The MaKe Company - Matthew Shu / Kevin Hou. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
