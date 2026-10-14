import React from 'react';
import { Wind, HeartPulse, Clock, ShieldAlert, Cpu } from 'lucide-react';
import { TwinStatusBadge, DataSourceBadge } from './StatusBadge';

export const EquipmentCard = ({
  twin,
  isSelected,
  onSelect,
}) => {
  const eq = twin.equipment;
  const isVentilator = eq.id === 'VEN-001';
  const Icon = isVentilator ? Wind : HeartPulse;
  const riskScore = twin.ai_risk_assessment?.risk_score ?? 0;
  const riskLevel = twin.ai_risk_assessment?.risk_level ?? 'Normal';

  // Format last updated time
  const formatTime = (ts) => {
    if (!ts) return 'Never';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return ts;
    }
  };

  return (
    <div
      onClick={() => onSelect(eq.id)}
      className={`relative cursor-pointer rounded-2xl p-5 transition-all duration-300 border text-left ${
        isSelected
          ? 'bg-slate-900/95 border-sky-500/80 shadow-[0_0_25px_rgba(14,165,233,0.2)] ring-1 ring-sky-500/50'
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 hover:shadow-lg'
      }`}
    >
      {/* Selection pill */}
      {isSelected && (
        <div className="absolute -top-2.5 right-6 bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-md tracking-wider">
          ACTIVE TWIN
        </div>
      )}

      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
              isVentilator
                ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
            }`}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {eq.id}
              </span>
              <span className="text-xs text-slate-400">{eq.department.split('(')[0].trim()}</span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5 tracking-tight">{eq.name}</h3>
          </div>
        </div>

        {/* Digital Twin Status Badge */}
        <TwinStatusBadge status={twin.digital_twin_status} />
      </div>

      {/* Sensor Count & Key Meta */}
      <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-800/80 my-3 text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">Model & Serial</span>
          <span className="text-slate-200 font-mono font-medium truncate block" title={eq.serial_number}>
            {eq.model}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Hospital Location</span>
          <span className="text-slate-200 font-medium truncate block" title={eq.location}>
            {eq.location}
          </span>
        </div>
      </div>

      {/* Risk Metric & Progress Bar */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            AI Risk Score
          </span>
          <span
            className={`font-mono font-bold ${
              riskLevel === 'Critical'
                ? 'text-rose-400'
                : riskLevel === 'Warning'
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {riskScore}% ({riskLevel})
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              riskLevel === 'Critical'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                : riskLevel === 'Warning'
                ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.max(5, Math.min(100, riskScore))}%` }}
          />
        </div>
      </div>

      {/* Footer Info Row */}
      <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>Updated: {formatTime(twin.last_updated)}</span>
        </div>

        <DataSourceBadge source={twin.data_source} />
      </div>
    </div>
  );
};
