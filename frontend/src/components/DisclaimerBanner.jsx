import React, { useState } from 'react';
import { ShieldAlert, AlertCircle, X, ChevronRight } from 'lucide-react';

export const DisclaimerBanner = () => {
  const [minimized, setMinimized] = useState(false);

  if (minimized) {
    return (
      <div className="bg-amber-950/40 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-between text-xs text-amber-300">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold">ENGINEERING NOTICE:</span>
          <span>EquipTwin-AI is strictly for biomedical predictive maintenance & telemetry prototyping.</span>
        </div>
        <button
          onClick={() => setMinimized(false)}
          className="text-amber-400 hover:text-amber-200 underline flex items-center gap-0.5 text-xs font-medium"
        >
          View Full Disclaimer <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-200 shadow-md">
      <div className="max-w-7xl mx-auto flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold tracking-wide uppercase text-amber-300 flex items-center gap-2">
              Clinical Disclaimer & Regulatory Boundary
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.2 rounded border border-amber-500/30 font-mono">
                NON-CLINICAL PROTOTYPE
              </span>
            </p>
            <p className="text-amber-200/90 leading-relaxed">
              EquipTwin-AI is an engineering digital twin platform engineered for predictive maintenance,
              equipment telemetry analytics, and operational risk management. This software is 
              <strong> NOT a certified medical diagnostic device</strong>, does not control therapy delivery,
              and must never supersede the clinical judgment of qualified medical staff or manufacturer safety protocols.
            </p>
          </div>
        </div>
        <button
          onClick={() => setMinimized(true)}
          className="text-amber-400/80 hover:text-amber-200 p-1 rounded hover:bg-amber-500/10 transition-colors"
          title="Minimize disclaimer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
