import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import DrugExplorer from './components/DrugExplorer';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <DrugExplorer />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default App;