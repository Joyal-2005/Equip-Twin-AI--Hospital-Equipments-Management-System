import React from 'react';
import { Info, MapPin, Calendar, Wrench, Shield, CheckCircle2 } from 'lucide-react';

export const EquipmentDetails = ({ equipment }) => {
  if (!equipment) return null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5">
      {/* Top Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
          <Info className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Equipment Specifications</h3>
          <p className="text-xs text-slate-400">Biomedical asset registry & sensor configuration</p>
        </div>
      </div>

      {/* Asset Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <span className="text-slate-400 block text-[11px]">Department</span>
          <span className="text-white font-semibold mt-0.5 block truncate" title={equipment.department}>
            {equipment.department}
          </span>
        </div>
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <span className="text-slate-400 block text-[11px] flex items-center gap-1">
            <MapPin className="w-3 h-3 text-sky-400" />
            Location
          </span>
          <span className="text-white font-semibold mt-0.5 block truncate" title={equipment.location}>
            {equipment.location}
          </span>
        </div>
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <span className="text-slate-400 block text-[11px] flex items-center gap-1">
            <Calendar className="w-3 h-3 text-sky-400" />
            Installed Date
          </span>
          <span className="text-white font-mono font-medium mt-0.5 block">
            {equipment.installed_date}
          </span>
        </div>
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <span className="text-slate-400 block text-[11px] flex items-center gap-1">
            <Wrench className="w-3 h-3 text-sky-400" />
            Last Serviced
          </span>
          <span className="text-white font-mono font-medium mt-0.5 block">
            {equipment.last_serviced_date}
          </span>
        </div>
      </div>

      {/* Sensor Specifications Table */}
      <div>
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
          Configured Sensor Channels ({equipment.sensors?.length || 0})
        </h4>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px]">
              <tr>
                <th className="px-3.5 py-2.5">Sensor</th>
                <th className="px-3 py-2.5">Unit</th>
                <th className="px-3 py-2.5">Nominal Operating Range</th>
                <th className="px-3 py-2.5">Critical Tolerance Limits</th>
                <th className="px-3.5 py-2.5">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
              {equipment.sensors?.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-3.5 py-2 font-bold text-white whitespace-nowrap">
                    {s.name}
                    <span className="block text-[10px] text-slate-400 font-normal font-sans">{s.id}</span>
                  </td>
                  <td className="px-3 py-2 text-sky-400 font-bold">{s.unit}</td>
                  <td className="px-3 py-2 text-emerald-400">
                    {s.id === 'air_in_blood' ? '0 (Clear)' : `${s.normal_min} - ${s.normal_max}`}
                  </td>
                  <td className="px-3 py-2 text-rose-400">
                    {s.critical_min !== undefined && s.critical_max !== undefined
                      ? `< ${s.critical_min} or > ${s.critical_max}`
                      : 'N/A'}
                  </td>
                  <td className="px-3.5 py-2 text-slate-400 font-sans text-xs min-w-[200px]">
                    {s.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
