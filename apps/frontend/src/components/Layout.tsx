import React from 'react';
import { Zap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="border-b border-gray-700 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold text-white">Bolt</span>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}