'use client';
import { ArrowRight, Play, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DocumentView } from '@/components/DocumentView';
import { PatientPreview } from '@/components/PatientPreview';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Comparison, ComparisonHandle, ComparisonItem } from '@/components/ui/kibo-ui/comparison';

export default function LandingPage() {
  const router = useRouter();
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-x-hidden w-full">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 w-full">
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
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="text-gray-900 hover:border-gray-900 hover:foi">Sign In</Button>
              </Link>
              <Button
                size="sm"
                className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white"
                onClick={() => router.push('/composer')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-primary-100/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 mb-6">
              <Star className="w-4 h-4 mr-2" />
              AI-Powered Medical Documentation
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Discharge to Patient Summary
              {' '}
              <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                in One Click
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform complex medical discharge summaries into clear, patient-friendly explanations.
              Powered by AI and backed by medical guidelines you can trust.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white px-12 py-4 text-lg"
                onClick={() => router.push('/discharge')}
              >
                Let me in!
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-gray-700 hover:bg-gray-50/50 px-12 py-4 text-lg"
                  >
                    <Play className="mr-2 w-5 h-5" />
                    Watch Demo
                  </Button>
                </DialogTrigger>
                <DialogContent className="min-w-10/12 p-0 bg-black">
                  <DialogHeader className="sr-only">
                    <DialogTitle>Demo Video</DialogTitle>
                  </DialogHeader>
                  <div className="relative w-full aspect-video">
                    <iframe
                      src="https://www.youtube.com/embed/5NJZYMS6NOk"
                      title="Demo Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-lg"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Before/After Slider */}
            <div className="relative max-w-6xl mx-auto">
              {/* Gradient glow background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 via-primary-500/30 to-primary-600/20 blur-3xl rounded-3xl transform scale-110"></div>
              <div className="relative">
                <div className="h-[600px]">
                  <Comparison className="h-full w-full">
                    <ComparisonItem position="left">
                      <PatientPreview />
                    </ComparisonItem>
                    <ComparisonItem position="right">
                      <DocumentView />
                    </ComparisonItem>
                    <ComparisonHandle />
                  </Comparison>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Share Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Share easily with patients
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Multiple ways to deliver patient-friendly summaries that improve understanding and compliance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Text Them */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="bg-primary-500/40 rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition-shadow">
                  <div className="rounded-xl p-4 h-80 flex items-center justify-center">
                    <img
                      src="/assets/images/previewText.png"
                      alt="SMS sharing interface"
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Text Them</h3>
              <p className="text-gray-600">
                Send patient summaries directly via SMS with secure links to their personalized dashboard
              </p>
            </div>

            {/* Share QR Code */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="bg-primary-500/40 rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition-shadow">
                  <div className="rounded-xl p-4 h-80 flex items-center justify-center">
                    <img
                      src="/assets/images/previewQr.png"
                      alt="QR code generation interface"
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Share a QR Code</h3>
              <p className="text-gray-600">
                Generate instant QR codes for quick access to patient summaries on any mobile device
              </p>
            </div>

            {/* Print PDF */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="bg-primary-500/40 rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition-shadow">
                  <div className="rounded-xl p-4 h-80 flex items-center justify-center">
                    <img
                      src="/assets/images/previewPDF.png"
                      alt="PDF export interface"
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Print out a PDF</h3>
              <p className="text-gray-600">
                Generate professional PDF summaries for physical handouts and patient records
              </p>
            </div>
          </div>
        </div>
      </section>

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
