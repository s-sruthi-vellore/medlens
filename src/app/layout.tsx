import type { Metadata } from 'next';
import './globals.css';
import { MedLensProvider } from '@/context/MedLensContext';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { Navbar } from '@/components/Navbar';
import { ShieldCheck, Server, GitBranch, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'MedLens – AI-Powered Clinical Information Intelligence',
  description: 'Clinical data extraction, structured medical record, provenance tracking, conflict detection, and patient-friendly AI summary.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased">
        <MedLensProvider>
          <DisclaimerBanner />
          <Navbar />
          
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>

          <footer className="border-t border-slate-800 bg-slate-900/80 mt-12 py-6 text-xs text-slate-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
              
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span className="font-semibold text-slate-200">MedLens Hackathon MVP</span>
                <span className="text-slate-500">• PromptWars Clinical AI Edition</span>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Server className="w-3.5 h-3.5 text-emerald-400" /> Cloud Run Containerized
                </span>
                <span className="flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5 text-indigo-400" /> GitHub Ready
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-400" /> Zero Reference Invention Rule
                </span>
              </div>

            </div>
          </footer>
        </MedLensProvider>
      </body>
    </html>
  );
}
