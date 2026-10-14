import React from 'react';
import { Gauge, AlertTriangle, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';

export const SensorReadingCard = ({ sensor, value, isFlagged, flagDetail }) => {
  const numVal = typeof value === 'number' ? value : parseFloat(value);
  const hasValue = !isNaN(numVal) && value !== undefined && value !== null;

  // Determine status against normal bounds
  let status = 'normal';
  let statusText = 'Normal';

  if (hasValue) {
    if (sensor.id === 'air_in_blood') {
      if (numVal >= 1.0) {
        status = 'critical';
        statusText = 'AIR DETECTED';
      } else {
        status = 'normal';
        statusText = 'Clear / Safe';
      }
    } else {
      const minCrit = sensor.critical_min ?? (sensor.normal_min * 0.7);
      const maxCrit = sensor.critical_max ?? (sensor.normal_max * 1.3);

      if (numVal < minCrit || numVal > maxCrit) {
        status = 'critical';
        statusText = 'Critical Breach';
      } else if (numVal < sensor.normal_min || numVal > sensor.normal_max) {
        status = 'warning';
        statusText = 'Abnormal Drift';
      } else {
        status = 'normal';
        statusText = 'In Safe Range';
      }
    }
  }

  const borderStyles = {
    normal: 'border-slate-800 bg-slate-900/60 hover:border-slate-700',
    warning: 'border-amber-500/40 bg-amber-950/20 hover:border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
    critical: 'border-rose-500/50 bg-rose-950/20 hover:border-rose-500/70 shadow-[0_0_20px_rgba(244,63,94,0.15)] animate-pulse-subtle',
  };

  const badgeStyles = {
    normal: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    critical: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
  };

  return (
    <div className={`rounded-xl border p-4 transition-all duration-200 ${borderStyles[status]}`}>
      {/* Top row: Sensor Name & Status Chip */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="font-mono text-[10px] text-slate-400 block uppercase tracking-wider">
            {sensor.id}
          </span>
          <h4 className="text-sm font-semibold text-white tracking-tight">{sensor.name}</h4>
        </div>
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeStyles[status]}`}>
          {status === 'critical' ? (
            <AlertOctagon className="w-3 h-3 text-rose-400" />
          ) : status === 'warning' ? (
            <AlertTriangle className="w-3 h-3 text-amber-400" />
          ) : (
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          )}
          {statusText}
        </span>
      </div>

      {/* Center Value Display */}
      <div className="my-3 flex items-baseline gap-2">
        <span className={`text-3xl font-extrabold font-mono tracking-tight ${
          status === 'critical'
            ? 'text-rose-400'
            : status === 'warning'
            ? 'text-amber-300'
            : 'text-white'
        }`}>
          {sensor.id === 'air_in_blood'
            ? (numVal >= 1.0 ? 'TRIGGERED' : '0 (CLEAR)')
            : (hasValue ? numVal.toFixed(sensor.unit === 'V' || sensor.unit === '°C' ? 2 : 1) : '--')}
        </span>
        <span className="text-sm font-medium text-slate-400">
          {sensor.unit !== 'flag' ? sensor.unit : ''}
        </span>
      </div>

      {/* Safe Tolerance Envelope */}
      <div className="pt-2 border-t border-slate-800/80 text-[11px] flex items-center justify-between text-slate-400">
        <span>Target Normal:</span>
        <span className="font-mono text-slate-300 font-medium">
          {sensor.id === 'air_in_blood'
            ? '0 (No bubbles)'
            : `${sensor.normal_min} - ${sensor.normal_max} ${sensor.unit}`}
        </span>
      </div>

      {/* Flagged Alert note if any */}
      {isFlagged && flagDetail && (
        <div className="mt-2.5 p-2 rounded bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300 leading-tight">
          {flagDetail.message}
        </div>
      )}
    </div>
  );
};
