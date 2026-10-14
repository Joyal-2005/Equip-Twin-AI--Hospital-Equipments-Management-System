import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, WifiOff, Cpu, Activity } from 'lucide-react';

export const TwinStatusBadge = ({ status, size = 'md' }) => {
  const normStatus = (status || 'Normal').toLowerCase();

  const configs = {
    normal: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      dot: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
      label: 'Normal',
      icon: CheckCircle2,
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      dot: 'bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-pulse',
      label: 'Warning',
      icon: AlertTriangle,
    },
    critical: {
      bg: 'bg-rose-500/15 border-rose-500/40 text-rose-400',
      dot: 'bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-ping',
      label: 'Critical',
      icon: AlertOctagon,
    },
    offline: {
      bg: 'bg-slate-700/20 border-slate-600/30 text-slate-400',
      dot: 'bg-slate-500',
      label: 'Offline',
      icon: WifiOff,
    },
  };

  const config = configs[normStatus] || configs.offline;
  const Icon = config.icon;

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5 gap-1.5' 
    : size === 'lg' 
      ? 'text-sm px-3.5 py-1.5 gap-2' 
      : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
};

export const DataSourceBadge = ({ source }) => {
  const isSimulated = (source || 'SIMULATED').toUpperCase() === 'SIMULATED';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase border ${
        isSimulated
          ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
          : 'bg-violet-500/10 border-violet-500/30 text-violet-400'
      }`}
      title={isSimulated ? 'Simulated software telemetry' : 'Physical ESP32 hardware telemetry'}
    >
      {isSimulated ? <Activity className="w-3 h-3 text-sky-400" /> : <Cpu className="w-3 h-3 text-violet-400" />}
      <span>{isSimulated ? 'SIMULATED' : 'ESP32 HARDWARE'}</span>
    </span>
  );
};

export const RiskBadge = ({ level, score }) => {
  const norm = (level || 'Normal').toLowerCase();
  const colors = {
    normal: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    critical: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-medium border ${colors[norm] || colors.normal}`}>
      <span>Risk: {score !== undefined ? `${score}%` : level}</span>
    </span>
  );
};
