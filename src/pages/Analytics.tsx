// src/pages/Analytics.tsx

import React from 'react';

export const Analytics: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-light mb-4">Drop Performance Analytics</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface p-4 rounded">
          <h2 className="text-sm text-txm">Total Revenue</h2>
          <p className="text-3xl font-light text-gold">$0</p>
        </div>
        <div className="bg-surface p-4 rounded">
          <h2 className="text-sm text-txm">Units Sold</h2>
          <p className="text-3xl font-light text-gold">0</p>
        </div>
        <div className="bg-surface p-4 rounded">
          <h2 className="text-sm text-txm">Avg Margin</h2>
          <p className="text-3xl font-light text-gold">0%</p>
        </div>
      </div>
    </div>
  );
};
