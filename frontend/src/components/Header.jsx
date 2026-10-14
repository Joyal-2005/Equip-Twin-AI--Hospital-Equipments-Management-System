import React from 'react';
import { Activity, Settings, RefreshCw, Radio, CheckCircle, AlertTriangle, ShieldCheck, Database } from 'lucide-react';
import { DataSourceBadge } from './StatusBadge';

export const Header = ({
  backendStatus,
  serviceNowStatus,
  autoRefresh,
  setAutoRefresh,
  lastRefreshTime,
  onManualRefresh,
  onOpenSettings,
  activeEquipmentId,
  currentDataSource,
  isRefreshing,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">EquipTwin-AI</h1>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono font-medium border border-sky-500/30">
                  DIGITAL TWIN v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Predictive Maintenance & Risk Management for Critical Hospital Assets
              </p>
            </div>
          </div>

          {/* Right Status Controls */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Active Data Source Indicator */}
            <div className="hidden md:flex items-center">
              <DataSourceBadge source={currentDataSource} />
            </div>

            {/* Backend Health Indicator */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                backendStatus === 'healthy'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
              title={backendStatus === 'healthy' ? 'FastAPI Backend Online' : 'FastAPI Backend Disconnected'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'healthy' ? 'bg-emerald-400' : 'bg-rose-400 animate-ping'
                }`}
              />
              <span className="hidden sm:inline">Backend:</span>
              <span className="font-semibold capitalize">{backendStatus}</span>
            </div>

            {/* ServiceNow Status Indicator */}
            <button
              onClick={onOpenSettings}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                serviceNowStatus?.configured && serviceNowStatus?.enabled
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700/60'
              }`}
              title="Click to inspect ServiceNow configuration"
            >
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">ServiceNow:</span>
              <span className="text-slate-400">{serviceNowStatus?.enabled ? 'Connected' : 'Standby'}</span>
            </button>

            {/* Auto Refresh Toggle */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 rounded-lg p-1 border border-slate-700">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors ${
                  autoRefresh
                    ? 'bg-sky-500/20 text-sky-400 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={autoRefresh ? 'Live Polling Active (3s)' : 'Live Polling Paused'}
              >
                <Radio className={`w-3 h-3 ${autoRefresh ? 'text-sky-400 animate-pulse' : 'text-slate-500'}`} />
                <span className="hidden md:inline">{autoRefresh ? 'Live (3s)' : 'Paused'}</span>
              </button>

              <button
                onClick={onManualRefresh}
                disabled={isRefreshing}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition-colors"
                title="Refresh telemetry now"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
              </button>
            </div>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
              title="Open System Settings & ServiceNow Gateway"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
