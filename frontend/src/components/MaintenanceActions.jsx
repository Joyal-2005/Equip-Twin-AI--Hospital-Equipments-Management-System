import React, { useState } from 'react';
import { Wrench, CheckCircle2, Clock, AlertTriangle, Send, FileText, ExternalLink } from 'lucide-react';
import { equipmentService } from '../services/api';

export const MaintenanceActions = ({
  recommendations = [],
  requests = [],
  equipmentId,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState('recommendations');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Handle Dispatching an Action into a Maintenance Request
  const handleDispatchAction = async (action) => {
    setIsSubmitting(true);
    setSubmitSuccess(null);
    try {
      const payload = {
        id: `REQ-${Date.now().toString().slice(-6)}`,
        equipment_id: equipmentId,
        title: action.title,
        description: action.description,
        severity: action.priority === 'CRITICAL' || action.priority === 'IMMEDIATE' ? 'Critical' : 'Medium',
        status: 'Open',
        recommended_actions: [action.title, `Est. Time: ${action.est_time}`],
      };

      const res = await equipmentService.createMaintenanceRequest(payload);
      setSubmitSuccess(`Dispatched request ${payload.id} successfully!`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to create maintenance request:', err);
      setSubmitSuccess('Failed to dispatch maintenance request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityStyles = {
    CRITICAL: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    IMMEDIATE: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    HIGH: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    MEDIUM: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    ROUTINE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
      {/* Tab Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Maintenance & Engineering</h3>
            <p className="text-xs text-slate-400">Contextual action triage & ServiceNow ticket logs</p>
          </div>
        </div>

        <div className="flex items-center bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              activeTab === 'recommendations'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Recommended Actions ({recommendations.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              activeTab === 'requests'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Maintenance Log ({requests.length})
          </button>
        </div>
      </div>

      {submitSuccess && (
        <div className="mb-4 p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-xs text-sky-300 flex items-center justify-between">
          <span>{submitSuccess}</span>
          <button onClick={() => setSubmitSuccess(null)} className="text-sky-400 hover:text-white font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* Tab 1: AI Recommended Actions */}
      {activeTab === 'recommendations' && (
        <div className="space-y-3">
          {recommendations.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">
              All sensors nominal. No urgent actions pending.
            </div>
          ) : (
            recommendations.map((action, idx) => (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        priorityStyles[action.priority] || priorityStyles.MEDIUM
                      }`}
                    >
                      {action.priority}
                    </span>
                    <span className="font-mono text-xs text-slate-400">{action.action_id}</span>
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {action.est_time}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white tracking-tight">{action.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{action.description}</p>
                </div>

                <button
                  onClick={() => handleDispatchAction(action)}
                  disabled={isSubmitting}
                  className="shrink-0 self-start md:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-semibold transition-colors"
                >
                  <Send className="w-3 h-3" />
                  Dispatch Ticket
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Maintenance Log / Incidents */}
      {activeTab === 'requests' && (
        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">
              No historical maintenance records found for this unit.
            </div>
          ) : (
            requests.map((req, idx) => (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-400">{req.id}</span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {req.severity}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      req.status === 'Resolved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-white tracking-tight">{req.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{req.description}</p>

                {req.servicenow_incident_number && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1 text-sky-400">
                      <FileText className="w-3.5 h-3.5" />
                      SN Incident: {req.servicenow_incident_number}
                    </span>
                    <span className="text-[11px] text-slate-500">ServiceNow Gateway Linked</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
