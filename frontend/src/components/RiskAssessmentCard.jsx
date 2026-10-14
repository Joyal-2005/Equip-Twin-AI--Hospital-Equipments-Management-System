import React from 'react';
import { ShieldAlert, AlertTriangle, AlertOctagon, CheckCircle2, Info, Cpu, Sparkles } from 'lucide-react';

export const RiskAssessmentCard = ({ assessment }) => {
  if (!assessment) return null;

  const failureProb = assessment.failure_probability ?? 0.05;
  const riskScore = assessment.risk_score ?? Math.round(failureProb * 100);
  const riskLevel = assessment.risk_level || 'Normal';
  const flaggedSensors = assessment.flagged_sensors || [];
  const modelMeta = assessment.model_metadata || {};

  const levelConfigs = {
    Normal: {
      color: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
      gaugeColor: '#10b981',
      title: 'Nominal Condition',
      sub: 'All observed sensor metrics fall within normal baseline tolerances.',
      icon: CheckCircle2,
    },
    Warning: {
      color: 'text-amber-400',
      border: 'border-amber-500/40',
      bg: 'bg-amber-500/10',
      gaugeColor: '#f59e0b',
      title: 'Elevated Risk (Early Wear / Sensor Drift)',
      sub: 'One or more telemetry parameters exhibiting significant deviation from expected baseline.',
      icon: AlertTriangle,
    },
    Critical: {
      color: 'text-rose-400',
      border: 'border-rose-500/50',
      bg: 'bg-rose-500/15',
      gaugeColor: '#f43f5e',
      title: 'High Failure Risk (Immediate Triage Needed)',
      sub: 'Critical parameter boundary violated. High probability of equipment breakdown or alarm stop.',
      icon: AlertOctagon,
    },
  };

  const config = levelConfigs[riskLevel] || levelConfigs.Normal;
  const Icon = config.icon;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">AI Predictive Health & Risk</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 uppercase">
                Prototype Estimate
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Heuristic anomaly scoring & predictive failure probability
            </p>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.border} ${config.color}`}>
          <Icon className="w-3.5 h-3.5" />
          {riskLevel}
        </span>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
        {/* Failure Probability Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Failure Probability (P_fail)</span>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
              v0.9.2
            </span>
          </div>

          <div className="flex items-baseline gap-2 my-1">
            <span className={`text-4xl font-extrabold font-mono tracking-tight ${config.color}`}>
              {(failureProb * 100).toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              [P = {failureProb.toFixed(3)}]
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="h-full transition-all duration-700 rounded-full"
              style={{
                width: `${Math.max(4, Math.min(100, failureProb * 100))}%`,
                backgroundColor: config.gaugeColor,
              }}
            />
          </div>
        </div>

        {/* Anomaly Score Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Statistical Anomaly Score</span>
            <span className="text-[10px] text-slate-500 font-mono">Normalized (0-1)</span>
          </div>

          <div className="flex items-baseline gap-2 my-1">
            <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
              {assessment.anomaly_score?.toFixed(2) || '0.00'}
            </span>
            <span className="text-xs text-slate-400">
              {assessment.anomaly_detected ? '• Anomaly Triggered' : '• In Envelope'}
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="h-full transition-all duration-700 rounded-full bg-sky-500"
              style={{
                width: `${Math.max(4, Math.min(100, (assessment.anomaly_score || 0) * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Flagged Sensors Alert Section if any */}
      {flaggedSensors.length > 0 && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <span>Telemetry Deviations Identified ({flaggedSensors.length}):</span>
          </div>
          <ul className="space-y-1.5 text-xs">
            {flaggedSensors.map((f, idx) => (
              <li key={idx} className="flex items-start gap-2 text-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="font-mono text-white uppercase">{f.sensor_id}:</strong> {f.message}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Prototype Disclaimer Footer */}
      <div className="mt-4 p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-start gap-2.5 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-300">Prototype Notice:</strong> Risk score and failure probability are
          simulated prototype projections developed for biomedical engineering research.
          This model has not undergone ISO 13485 clinical device validation.
        </p>
      </div>
    </div>
  );
};
