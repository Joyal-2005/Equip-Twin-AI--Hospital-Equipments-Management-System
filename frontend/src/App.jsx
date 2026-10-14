import React, { useState, useEffect, useCallback } from 'react';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Header } from './components/Header';
import { EquipmentCard } from './components/EquipmentCard';
import { SensorReadingCard } from './components/SensorReadingCard';
import { HistoricalCharts } from './components/HistoricalCharts';
import { RiskAssessmentCard } from './components/RiskAssessmentCard';
import { MaintenanceActions } from './components/MaintenanceActions';
import { EquipmentDetails } from './components/EquipmentDetails';
import { SimulationControl } from './components/SimulationControl';
import { SettingsModal } from './components/SettingsModal';
import { TwinStatusBadge, DataSourceBadge } from './components/StatusBadge';
import { equipmentService } from './services/api';
import { Activity, Clock, WifiOff } from 'lucide-react';

export default function App() {
  const [selectedId, setSelectedId] = useState('VEN-001');
  const [twinsOverview, setTwinsOverview] = useState([]);
  const [activeTwin, setActiveTwin] = useState(null);
  const [backendStatus, setBackendStatus] = useState('healthy');
  const [backendHealth, setBackendHealth] = useState(null);
  const [serviceNowStatus, setServiceNowStatus] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [error, setError] = useState(null);

  // Fetch twin data
  const loadData = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      // 1. Fetch overview of both twins
      const overviewData = await equipmentService.getTwinsOverview();
      setTwinsOverview(overviewData);

      // 2. Fetch specific active twin snapshot
      const snapshot = await equipmentService.getTwinSnapshot(selectedId);
      setActiveTwin(snapshot);

      // 3. Health & ServiceNow status
      const [health, sn] = await Promise.all([
        equipmentService.getHealth().catch(() => null),
        equipmentService.getServiceNowStatus().catch(() => null),
      ]);

      if (health) {
        setBackendHealth(health);
        setBackendStatus('healthy');
      }
      if (sn) {
        setServiceNowStatus(sn);
      }
      setError(null);
      setLastRefreshTime(new Date());
    } catch (err) {
      console.error('Failed to poll EquipTwin backend:', err);
      setBackendStatus('disconnected');
      setError('Unable to reach FastAPI backend service. Ensure backend is running at http://127.0.0.1:8000.');
    } finally {
      if (showSpinner) setIsRefreshing(false);
    }
  }, [selectedId]);

  // Initial load
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Auto-refresh timer loop (every 3 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadData(false);
    }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadData]);

  // Find currently selected twin from overview or snapshot
  const currentTwin = activeTwin || twinsOverview.find((t) => t.equipment?.id === selectedId);

  // Map sensor flagged details for quick lookup
  const flaggedMap = {};
  if (currentTwin?.ai_risk_assessment?.flagged_sensors) {
    for (const f of currentTwin.ai_risk_assessment.flagged_sensors) {
      flaggedMap[f.sensor_id] = f;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* 1. Clinical Disclaimer Banner */}
      <DisclaimerBanner />

      {/* 2. Top Navigation Bar */}
      <Header
        backendStatus={backendStatus}
        serviceNowStatus={serviceNowStatus}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        lastRefreshTime={lastRefreshTime}
        onManualRefresh={() => loadData(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeEquipmentId={selectedId}
        currentDataSource={currentTwin?.data_source}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 w-full">
        {/* Backend Connection Error Banner if disconnected */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-rose-800 shadow-xs">
            <div className="flex items-center gap-3">
              <WifiOff className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <strong className="font-bold">Backend Connection Error: </strong>
                <span>{error}</span>
              </div>
            </div>
            <button
              onClick={() => loadData(true)}
              className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 text-xs font-semibold shrink-0 transition-colors shadow-xs"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Equipment Selection Cards (VEN-001 & DIA-001) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Monitored Hospital Equipment</h2>
              <p className="text-xs text-slate-500">Select an asset to view its active Digital Twin mirror</p>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {twinsOverview.length} assets actively synchronized
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {twinsOverview.map((twin) => (
              <EquipmentCard
                key={twin.equipment?.id}
                twin={twin}
                isSelected={twin.equipment?.id === selectedId}
                onSelect={(id) => setSelectedId(id)}
              />
            ))}
          </div>
        </div>

        {/* Interactive Sensor Simulator Trigger Bar */}
        <SimulationControl
          equipmentId={selectedId}
          onSimulationTriggered={() => loadData(false)}
        />

        {/* Active Twin Core Telemetry & AI Grid */}
        {currentTwin ? (
          <div className="space-y-6">
            {/* Active Twin Status Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                  {currentTwin.equipment?.id}
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {currentTwin.equipment?.name} Digital Twin
                  </h3>
                  <p className="text-xs text-slate-500">
                    Location: {currentTwin.equipment?.location} • Serial: {currentTwin.equipment?.serial_number}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DataSourceBadge source={currentTwin.data_source} />
                <TwinStatusBadge status={currentTwin.digital_twin_status} size="lg" />
              </div>
            </div>

            {/* Current Sensor Readings Cards Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">
                  Active Telemetry Feeds ({currentTwin.equipment?.sensors?.length || 0} Sensors)
                </h3>
                <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Last Packet: {currentTwin.seconds_since_update !== undefined ? `${currentTwin.seconds_since_update}s ago` : 'Real-time'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
                {currentTwin.equipment?.sensors?.map((sensor) => (
                  <SensorReadingCard
                    key={sensor.id}
                    sensor={sensor}
                    value={currentTwin.current_readings?.[sensor.id]}
                    isFlagged={!!flaggedMap[sensor.id]}
                    flagDetail={flaggedMap[sensor.id]}
                  />
                ))}
              </div>
            </div>

            {/* Mid Section: Charts (Left) & AI Risk + Maintenance (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Historical Time-Series Charts (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <HistoricalCharts
                  history={currentTwin.history}
                  sensors={currentTwin.equipment?.sensors}
                  equipmentId={selectedId}
                />

                {/* Equipment Specifications & Sensor Bounds */}
                <EquipmentDetails equipment={currentTwin.equipment} />
              </div>

              {/* Right Column: AI Risk Engine & Maintenance Actions (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <RiskAssessmentCard
                  assessment={currentTwin.ai_risk_assessment}
                />

                <MaintenanceActions
                  recommendations={currentTwin.recommended_actions || []}
                  requests={currentTwin.maintenance_requests || []}
                  equipmentId={selectedId}
                  onRefresh={() => loadData(false)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
            <Activity className="w-8 h-8 animate-spin mx-auto text-sky-600 mb-3" />
            <p className="text-sm">Connecting to EquipTwin Digital Twin state engine...</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">EquipTwin-AI</span>
            <span>• An AI-Driven Digital Twin Framework for Predictive Maintenance</span>
          </div>
          <div className="text-[11px] text-slate-400 text-center sm:text-right">
            <span>Prototype Version 1.0.0 • Biomedical Research Edition • Non-Clinical</span>
          </div>
        </div>
      </footer>

      {/* Settings & ServiceNow Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        serviceNowStatus={serviceNowStatus}
        backendHealth={backendHealth}
        onRefreshStatus={() => loadData(false)}
      />
    </div>
  );
}
