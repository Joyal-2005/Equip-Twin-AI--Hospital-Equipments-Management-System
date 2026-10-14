import React, { useState } from 'react';
import { X, Database, Server, CheckCircle2, KeyRound, RefreshCw, HelpCircle } from 'lucide-react';
import { equipmentService } from '../services/api';

export const SettingsModal = ({
  isOpen,
  onClose,
  serviceNowStatus,
  backendHealth,
}) => {
  if (!isOpen) return null;

  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [syncingIncident, setSyncingIncident] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await equipmentService.testServiceNowConnection();
      setTestResult(res);
    } catch (err) {
      setTestResult({
        success: false,
        message: err.response?.data?.message || err.message || 'Connection test failed',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleManualSync = async () => {
    setSyncingIncident(true);
    setSyncResult(null);
    try {
      const res = await equipmentService.syncServiceNowIncident('VEN-001');
      setSyncResult(res);
    } catch (err) {
      setSyncResult({
        error: err.response?.data?.detail || err.message || 'Dispatch failed',
      });
    } finally {
      setSyncingIncident(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">System & ServiceNow Gateway</h3>
              <p className="text-xs text-slate-500">Environment status, REST endpoint health & ITSM bridge</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 pt-5">
          {/* Section 1: Backend API Health */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-600" />
              FastAPI Core Backend Engine
            </h4>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 space-y-3 text-xs shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status</span>
                <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {backendHealth?.status || 'Online'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">API Prefix</span>
                <span className="font-mono text-slate-800">/api/v1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">AI Engine Mode</span>
                <span className="font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                  {backendHealth?.mode || 'PROTOTYPE'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Clinical Triage Constraint</span>
                <span className="text-amber-800 font-medium">Biomedical Engineering Only</span>
              </div>
            </div>
          </div>

          {/* Section 2: ServiceNow Integration Gateway */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Database className="w-4 h-4 text-sky-600" />
                ServiceNow ITOM / ITSM Integration
              </h4>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shadow-xs ${
                  serviceNowStatus?.enabled
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {serviceNowStatus?.status || 'Disabled (Standby)'}
              </span>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 space-y-3 text-xs shadow-xs">
              {/* Security Banner */}
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 flex items-start gap-2.5 text-slate-700">
                <KeyRound className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Security Guarantee:</strong> ServiceNow credentials and authentication tokens are kept strictly in
                  the backend environment (<code>backend/.env</code>). Credentials are never exposed or returned to the browser.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Instance Host</span>
                  <span className="font-mono text-slate-800 truncate block mt-0.5 font-semibold">
                    {serviceNowStatus?.instance_host || 'Not Configured'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Target Incident Table</span>
                  <span className="font-mono text-slate-800 block mt-0.5 font-semibold">
                    {serviceNowStatus?.table_incident || 'incident'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Telemetry Table</span>
                  <span className="font-mono text-slate-800 block mt-0.5 font-semibold">
                    {serviceNowStatus?.table_telemetry || 'u_hospital_equipment_telemetry'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Service Account</span>
                  <span className="font-mono text-slate-800 block mt-0.5 font-semibold">
                    {serviceNowStatus?.safe_username || 'Not Set'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold transition-colors shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                  Test ServiceNow Connection
                </button>

                <button
                  onClick={handleManualSync}
                  disabled={syncingIncident}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-xs"
                >
                  Simulate Incident Ticket Dispatch
                </button>
              </div>

              {/* Test Results */}
              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs mt-3 ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  <div className="font-bold mb-0.5">{testResult.success ? 'Success' : 'Connection Standby'}</div>
                  <div className="text-[11px] leading-relaxed">{testResult.message}</div>
                </div>
              )}

              {syncResult && (
                <div className="p-3 rounded-xl border bg-white border-slate-200 text-xs mt-3 text-slate-800">
                  <div className="font-bold text-slate-900 mb-1">Dispatch Output:</div>
                  <div className="text-[11px] font-mono text-sky-700">{JSON.stringify(syncResult, null, 2)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Setup Instructions */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-600 shadow-xs">
            <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
              Activating Real ServiceNow Instance:
            </h5>
            <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
              <li>Open <code>backend/.env</code> in your favorite code editor.</li>
              <li>Set <code>SERVICENOW_ENABLED=true</code>.</li>
              <li>Enter your ServiceNow Instance URL (e.g. <code>https://dev12345.service-now.com</code>).</li>
              <li>Provide REST API user credentials in <code>SERVICENOW_USERNAME</code> and <code>SERVICENOW_PASSWORD</code>.</li>
              <li>Restart the FastAPI backend server.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-5 mt-6 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-xs"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
