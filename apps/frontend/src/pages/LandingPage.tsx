import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface LandingPageProps {
  onPromptSubmit: (prompt: string) => void;
}

export function LandingPage({ onPromptSubmit }: LandingPageProps) {
  const [promptText, setPromptText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promptText.trim()) {
      onPromptSubmit(promptText);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Build your next project with AI
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-300">
          Just describe what you want to build, and let AI handle the rest
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-12">
        <div className="relative">
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Describe your project..."
            className="w-full h-32 p-4 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-white placeholder-gray-400"
          />
          <button
            type="submit"
            className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate
          </button>
        </div>
      </form>

      <div className="mt-12">
        <img
          src="https://images.unsplash.com/photo-1618335829737-2228915674e0?auto=format&fit=crop&q=80&w=1000"
          alt="Coding illustration"
          className="rounded-lg shadow-xl w-full"
        />
      </div>
    </div>
  );
}