import React, { useState } from 'react';
import { Activity, Play, AlertTriangle, AlertOctagon, CheckCircle2, Loader2 } from 'lucide-react';
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
    <div className="bg-gradient-to-r from-slate-900 via-sky-950/30 to-slate-900 border border-sky-500/30 rounded-2xl p-4 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white tracking-tight">Interactive Sensor Simulator</h4>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                SIMULATED DATA
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Inject synthetic telemetry packets into {equipmentId} to test Digital Twin state transitions
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleSimulate('normal')}
            disabled={!!loadingScenario}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all hover:scale-105"
            title="Inject nominal physiological sensor values"
          >
            {loadingScenario === 'normal' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            Normal Scenario
          </button>

          <button
            onClick={() => handleSimulate('warning')}
            disabled={!!loadingScenario}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all hover:scale-105"
            title="Inject moderate sensor drift values"
          >
            {loadingScenario === 'warning' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            )}
            Warning Drift
          </button>

          <button
            onClick={() => handleSimulate('critical')}
            disabled={!!loadingScenario}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-all hover:scale-105 shadow-sm"
            title="Inject boundary breach or bubble alarm"
          >
            {loadingScenario === 'critical' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            )}
            Critical Alarm
          </button>
        </div>
      </div>

      {lastMessage && (
        <div
          className={`mt-3 px-3 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between ${
            lastMessage.type === 'critical'
              ? 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
              : lastMessage.type === 'warning'
              ? 'bg-amber-950/40 border border-amber-500/30 text-amber-300'
              : 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
          }`}
        >
          <span>{lastMessage.text}</span>
          <button onClick={() => setLastMessage(null)} className="font-bold text-slate-400 hover:text-white">
            ×
          </button>
        </div>
      )}
    </div>
  );
};
