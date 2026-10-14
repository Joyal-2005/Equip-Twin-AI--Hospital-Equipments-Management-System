import React, { useState } from 'react';
import { Wrench, Clock, Send, FileText } from 'lucide-react';
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

      await equipmentService.createMaintenanceRequest(payload);
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
    CRITICAL: 'bg-rose-50 text-rose-700 border-rose-200',
    IMMEDIATE: 'bg-rose-50 text-rose-700 border-rose-200',
    HIGH: 'bg-amber-50 text-amber-700 border-amber-200',
    MEDIUM: 'bg-sky-50 text-sky-700 border-sky-200',
    ROUTINE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      {/* Tab Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Maintenance & Engineering</h3>
            <p className="text-xs text-slate-500">Contextual action triage & ServiceNow ticket logs</p>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              activeTab === 'recommendations'
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Recommended Actions ({recommendations.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              activeTab === 'requests'
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Maintenance Log ({requests.length})
          </button>
        </div>
      </div>

      {submitSuccess && (
        <div className="mb-4 p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-xs text-sky-800 flex items-center justify-between">
          <span>{submitSuccess}</span>
          <button onClick={() => setSubmitSuccess(null)} className="text-sky-600 hover:text-sky-900 font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* Tab 1: AI Recommended Actions */}
      {activeTab === 'recommendations' && (
        <div className="space-y-3">
          {recommendations.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">
              All sensors nominal. No urgent actions pending.
            </div>
          ) : (
            recommendations.map((action, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-300 transition-colors shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shadow-xs ${
                        priorityStyles[action.priority] || priorityStyles.MEDIUM
                      }`}
                    >
                      {action.priority}
                    </span>
                    <span className="font-mono text-xs text-slate-500">{action.action_id}</span>
                    <span className="text-slate-500 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {action.est_time}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 tracking-tight">{action.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{action.description}</p>
                </div>

                <button
                  onClick={() => handleDispatchAction(action)}
                  disabled={isSubmitting}
                  className="shrink-0 self-start md:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold transition-colors shadow-xs"
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
            <div className="p-6 text-center text-slate-400 text-sm">
              No historical maintenance records found for this unit.
            </div>
          ) : (
            requests.map((req, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 space-y-2 hover:border-slate-300 transition-colors shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-700">{req.id}</span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                      {req.severity}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      req.status === 'Resolved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-slate-900 tracking-tight">{req.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{req.description}</p>

                {req.servicenow_incident_number && (
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span className="flex items-center gap-1 text-sky-700 font-semibold">
                      <FileText className="w-3.5 h-3.5" />
                      SN Incident: {req.servicenow_incident_number}
                    </span>
                    <span className="text-[11px] text-slate-400">ServiceNow Gateway Linked</span>
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
