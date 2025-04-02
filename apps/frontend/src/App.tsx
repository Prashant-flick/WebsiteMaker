import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { PreviewPage } from './pages/PreviewPage';

function App() {
  const [prompt, setPrompt] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handlePromptSubmit = (promptText: string) => {
    setPrompt(promptText);
    setIsPreviewMode(true);
  };

  return (
    <Layout>
      {!isPreviewMode ? (
        <LandingPage onPromptSubmit={handlePromptSubmit} />
      ) : (
        <PreviewPage prompt={prompt} />
      )}
    </Layout>
  );
}

export default App;