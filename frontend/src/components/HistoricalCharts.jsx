import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { LineChart as ChartIcon } from 'lucide-react';

export const HistoricalCharts = ({ history, sensors, equipmentId }) => {
  if (!sensors || sensors.length === 0) return null;

  // Selected sensor channel to view
  const [selectedSensorId, setSelectedSensorId] = useState(sensors[0].id);

  // If selected sensor isn't in current list, fallback to first
  const activeSensor = sensors.find((s) => s.id === selectedSensorId) || sensors[0];

  // Custom chart tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const val = data[activeSensor.id];
      return (
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-lg text-xs space-y-1">
          <p className="text-slate-400 font-mono text-[10px]">{data.timestamp || label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-slate-900 font-bold text-base font-mono">
              {typeof val === 'number' ? val.toFixed(2) : val}
            </span>
            <span className="text-slate-500 font-medium">{activeSensor.unit}</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            Normal Band: {activeSensor.normal_min} - {activeSensor.normal_max} {activeSensor.unit}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      {/* Header & Sensor Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
            <ChartIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Real-Time Telemetry Trends</h3>
            <p className="text-xs text-slate-500">
              Historical time-series telemetry buffer ({history?.length || 0} packets recorded)
            </p>
          </div>
        </div>

        {/* Sensor Channel Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          {sensors.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSensorId(s.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeSensor.id === s.id
                  ? 'bg-sky-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              {s.name.split(' ')[0]} ({s.unit})
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full">
        {(!history || history.length === 0) ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            Waiting for telemetry history stream...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sensorGradientLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="time_short"
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Reference Lines for Normal Limits */}
              {activeSensor.normal_min !== undefined && (
                <ReferenceLine
                  y={activeSensor.normal_min}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeOpacity={0.7}
                  label={{
                    value: `Min: ${activeSensor.normal_min}`,
                    fill: '#059669',
                    fontSize: 10,
                    position: 'insideBottomLeft',
                  }}
                />
              )}
              {activeSensor.normal_max !== undefined && (
                <ReferenceLine
                  y={activeSensor.normal_max}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeOpacity={0.7}
                  label={{
                    value: `Max: ${activeSensor.normal_max}`,
                    fill: '#d97706',
                    fontSize: 10,
                    position: 'insideTopLeft',
                  }}
                />
              )}

              <Area
                type="monotone"
                dataKey={activeSensor.id}
                stroke="#0284c7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#sensorGradientLight)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
