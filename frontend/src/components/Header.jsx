import React from 'react';
import { Activity, Settings, RefreshCw, Radio, Database } from 'lucide-react';
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
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-500 flex items-center justify-center shadow-md shadow-sky-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">EquipTwin-AI</h1>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-mono font-semibold border border-sky-200">
                  DIGITAL TWIN v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
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
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border shadow-xs ${
                backendStatus === 'healthy'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
              title={backendStatus === 'healthy' ? 'FastAPI Backend Online' : 'FastAPI Backend Disconnected'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'healthy' ? 'bg-emerald-500' : 'bg-rose-500 animate-ping'
                }`}
              />
              <span className="hidden sm:inline">Backend:</span>
              <span className="font-semibold capitalize">{backendStatus}</span>
            </div>

            {/* ServiceNow Status Indicator */}
            <button
              onClick={onOpenSettings}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border shadow-xs transition-colors ${
                serviceNowStatus?.configured && serviceNowStatus?.enabled
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Click to inspect ServiceNow configuration"
            >
              <Database className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">ServiceNow:</span>
              <span className="text-slate-600 font-semibold">{serviceNowStatus?.enabled ? 'Connected' : 'Standby'}</span>
            </button>

            {/* Auto Refresh Toggle */}
            <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1 border border-slate-200 shadow-xs">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors ${
                  autoRefresh
                    ? 'bg-white text-sky-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={autoRefresh ? 'Live Polling Active (3s)' : 'Live Polling Paused'}
              >
                <Radio className={`w-3 h-3 ${autoRefresh ? 'text-sky-600 animate-pulse' : 'text-slate-400'}`} />
                <span className="hidden md:inline">{autoRefresh ? 'Live (3s)' : 'Paused'}</span>
              </button>

              <button
                onClick={onManualRefresh}
                disabled={isRefreshing}
                className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-white transition-colors"
                title="Refresh telemetry now"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
              </button>
            </div>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 border border-slate-200/80 transition-colors shadow-xs"
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
