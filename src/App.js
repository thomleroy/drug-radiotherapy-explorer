import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import DrugExplorer from './components/DrugExplorer';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <DrugExplorer />
      <Analytics />
    </div>
  );
}

export default App;