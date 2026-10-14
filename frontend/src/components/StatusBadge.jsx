import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, WifiOff, Cpu, Activity } from 'lucide-react';

export const TwinStatusBadge = ({ status, size = 'md' }) => {
  const normStatus = (status || 'Normal').toLowerCase();

  const configs = {
    normal: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      dot: 'bg-emerald-500 shadow-[0_0_6px_#10b981]',
      label: 'Normal',
      icon: CheckCircle2,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-700',
      dot: 'bg-amber-500 shadow-[0_0_6px_#f59e0b] animate-pulse',
      label: 'Warning',
      icon: AlertTriangle,
    },
    critical: {
      bg: 'bg-rose-50 border-rose-200 text-rose-700',
      dot: 'bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-ping',
      label: 'Critical',
      icon: AlertOctagon,
    },
    offline: {
      bg: 'bg-slate-100 border-slate-200 text-slate-600',
      dot: 'bg-slate-400',
      label: 'Offline',
      icon: WifiOff,
    },
  };

  const config = configs[normStatus] || configs.offline;
  const Icon = config.icon;

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5 gap-1.5' 
    : size === 'lg' 
      ? 'text-sm px-3.5 py-1.5 gap-2 font-semibold' 
      : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span className={`inline-flex items-center rounded-full border shadow-xs ${config.bg} ${sizeClasses}`}>
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase border shadow-xs ${
        isSimulated
          ? 'bg-sky-50 border-sky-200 text-sky-700'
          : 'bg-purple-50 border-purple-200 text-purple-700'
      }`}
      title={isSimulated ? 'Simulated software telemetry' : 'Physical ESP32 hardware telemetry'}
    >
      {isSimulated ? <Activity className="w-3 h-3 text-sky-600" /> : <Cpu className="w-3 h-3 text-purple-600" />}
      <span>{isSimulated ? 'SIMULATED' : 'ESP32 HARDWARE'}</span>
    </span>
  );
};

export const RiskBadge = ({ level, score }) => {
  const norm = (level || 'Normal').toLowerCase();
  const colors = {
    normal: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    warning: 'text-amber-700 bg-amber-50 border-amber-200',
    critical: 'text-rose-700 bg-rose-50 border-rose-200',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-medium border ${colors[norm] || colors.normal}`}>
      <span>Risk: {score !== undefined ? `${score}%` : level}</span>
    </span>
  );
};
