import React, { useState } from 'react';
import { Activity, AlertTriangle, AlertOctagon, CheckCircle2, Loader2 } from 'lucide-react';
import { equipmentService } from '../services/api';

export const SimulationControl = ({ equipmentId, onSimulationTriggered }) => {
  const [loadingScenario, setLoadingScenario] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);

  const handleSimulate = async (scenario) => {
    setLoadingScenario(scenario);
    setLastMessage(null);
    try {
      const res = await equipmentService.triggerSimulation(equipmentId, scenario);
      setLastMessage({
        type: scenario,
        text: `Injected [SIMULATED] ${scenario.toUpperCase()} telemetry packet for ${equipmentId}`,
      });
      if (onSimulationTriggered) {
        onSimulationTriggered();
      }
    } catch (err) {
      console.error('Simulation error:', err);
      setLastMessage({
        type: 'error',
        text: 'Failed to inject simulated telemetry packet.',
      });
    } finally {
      setLoadingScenario(null);
    }
  };

  return (
    <div className="bg-gradient-to-r from-sky-50/70 via-white to-sky-50/70 border border-sky-200/90 rounded-2xl p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">Interactive Sensor Simulator</h4>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-700 border border-sky-200">
                SIMULATED DATA
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Inject synthetic telemetry packets into {equipmentId} to test Digital Twin state transitions
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleSimulate('normal')}
            disabled={!!loadingScenario}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-all hover:scale-105 shadow-xs"
            title="Inject nominal physiological sensor values"
          >
            {loadingScenario === 'normal' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
            Normal Scenario
          </button>

          <button
            onClick={() => handleSimulate('warning')}
            disabled={!!loadingScenario}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-all hover:scale-105 shadow-xs"
            title="Inject moderate sensor drift values"
          >
            {loadingScenario === 'warning' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            )}
            Warning Drift
          </button>

          <button
            onClick={() => handleSimulate('critical')}
            disabled={!!loadingScenario}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold transition-all hover:scale-105 shadow-xs"
            title="Inject boundary breach or bubble alarm"
          >
            {loadingScenario === 'critical' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
            ) : (
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            )}
            Critical Alarm
          </button>
        </div>
      </div>

      {lastMessage && (
        <div
          className={`mt-3 px-3 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between border shadow-xs ${
            lastMessage.type === 'critical'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : lastMessage.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <span>{lastMessage.text}</span>
          <button onClick={() => setLastMessage(null)} className="font-bold text-slate-400 hover:text-slate-700">
            ×
          </button>
        </div>
      )}
    </div>
  );
};
