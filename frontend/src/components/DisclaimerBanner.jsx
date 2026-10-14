import React, { useState } from 'react';
import { ShieldAlert, X, ChevronRight } from 'lucide-react';

export const DisclaimerBanner = () => {
  const [minimized, setMinimized] = useState(false);

  if (minimized) {
    return (
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 flex items-center justify-between text-xs text-amber-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          <span className="font-semibold">ENGINEERING NOTICE:</span>
          <span>EquipTwin-AI is strictly for biomedical predictive maintenance & telemetry prototyping.</span>
        </div>
        <button
          onClick={() => setMinimized(false)}
          className="text-amber-700 hover:text-amber-900 underline flex items-center gap-0.5 text-xs font-medium"
        >
          View Full Disclaimer <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold tracking-wide uppercase text-amber-900 flex items-center gap-2">
              Clinical Disclaimer & Regulatory Boundary
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300 font-mono font-semibold">
                NON-CLINICAL PROTOTYPE
              </span>
            </p>
            <p className="text-amber-800/90 leading-relaxed text-xs">
              EquipTwin-AI is an engineering digital twin platform engineered for predictive maintenance,
              equipment telemetry analytics, and operational risk management. This software is 
              <strong> NOT a certified medical diagnostic device</strong>, does not control therapy delivery,
              and must never supersede the clinical judgment of qualified medical staff or manufacturer safety protocols.
            </p>
          </div>
        </div>
        <button
          onClick={() => setMinimized(true)}
          className="text-amber-600 hover:text-amber-900 p-1 rounded hover:bg-amber-100 transition-colors"
          title="Minimize disclaimer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
