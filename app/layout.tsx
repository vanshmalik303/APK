import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import MobileNavigation from '@/components/MobileNavigation';

export const metadata: Metadata = {
  title: 'APKGuard — Android Security Analysis Platform',
  description: 'Inspect Android applications for security vulnerabilities, permission misconfigurations, and source code risks before deployment.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-white min-h-screen flex antialiased">
        {/* Desktop Sidebar (Fixed 3 items) */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0 overflow-y-auto w-full">
          {children}
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNavigation />
      </body>
    </html>
  );
}
