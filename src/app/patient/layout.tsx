import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Discharge Summary | Discharger',
  description: 'Your personalized recovery guide with medications, tasks, and important information.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Discharge Summary',
  },
};

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
