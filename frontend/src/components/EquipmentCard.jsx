import React from 'react';
import { Wind, HeartPulse, Clock, ShieldAlert } from 'lucide-react';
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
          ? 'bg-white border-sky-500 shadow-md shadow-sky-500/10 ring-2 ring-sky-500/20'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md shadow-xs'
      }`}
    >
      {/* Selection pill */}
      {isSelected && (
        <div className="absolute -top-2.5 right-6 bg-gradient-to-r from-sky-600 to-cyan-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-sm tracking-wider">
          ACTIVE TWIN
        </div>
      )}

      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
              isVentilator
                ? 'bg-sky-50 border-sky-200 text-sky-600'
                : 'bg-indigo-50 border-indigo-200 text-indigo-600'
            }`}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {eq.id}
              </span>
              <span className="text-xs text-slate-500">{eq.department.split('(')[0].trim()}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5 tracking-tight">{eq.name}</h3>
          </div>
        </div>

        {/* Digital Twin Status Badge */}
        <TwinStatusBadge status={twin.digital_twin_status} />
      </div>

      {/* Sensor Count & Key Meta */}
      <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-100 my-3 text-xs">
        <div>
          <span className="text-slate-500 block text-[11px]">Model & Serial</span>
          <span className="text-slate-800 font-mono font-medium truncate block mt-0.5" title={eq.serial_number}>
            {eq.model}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Hospital Location</span>
          <span className="text-slate-800 font-medium truncate block mt-0.5" title={eq.location}>
            {eq.location}
          </span>
        </div>
      </div>

      {/* Risk Metric & Progress Bar */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            AI Risk Score
          </span>
          <span
            className={`font-mono font-bold ${
              riskLevel === 'Critical'
                ? 'text-rose-600'
                : riskLevel === 'Warning'
                ? 'text-amber-600'
                : 'text-emerald-600'
            }`}
          >
            {riskScore}% ({riskLevel})
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/50">
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
      <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>Updated: {formatTime(twin.last_updated)}</span>
        </div>

        <DataSourceBadge source={twin.data_source} />
      </div>
    </div>
  );
};
