
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Home as HomeIcon, 
  Map as MapIcon, 
  LayoutGrid, 
  Bell, 
  ChevronRight, 
  Maximize2,
  Cpu, 
  RefreshCcw,
  Target,
  Waves,
  MapPin,
  CheckCircle2,
  Activity,
  Layers,
  Zap,
  Radio,
  Search,
  BarChart3,
  Loader2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Droplets,
  Building2,
  Truck,
  Database,
  Eye,
  Thermometer
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { City, DashboardModule, ClimateMetric, AIInsight } from './types';
import { getClimateInsights, fetchLiveClimateData, getLocalRiskAreas } from './geminiService';

const CITY_COORDS = {
  [City.SINGAPORE]: { lat: 1.3521, lng: 103.8198 },
  [City.HONG_KONG]: { lat: 22.3193, lng: 114.1694 }
};

const SYNC_DATA = [
  { time: '08:00', sync: 98, stress: 12 },
  { time: '10:00', sync: 99, stress: 15 },
  { time: '12:00', sync: 96, stress: 45 },
  { time: '14:00', sync: 92, stress: 68 },
  { time: '16:00', sync: 95, stress: 30 },
  { time: '18:00', sync: 98, stress: 18 },
];

type ViewState = 'home' | 'map' | 'insights' | 'alerts' | 'sensors';
type MapLayer = 'rgb' | 'thermal' | 'precipitation';

const App: React.FC = () => {
  const [activeCity, setActiveCity] = useState<City>(City.SINGAPORE);
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [activeLayer, setActiveLayer] = useState<MapLayer>('rgb');
  const [metrics, setMetrics] = useState<ClimateMetric[]>([]);
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [riskNodes, setRiskNodes] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  const lastFetchRef = useRef<number>(0);

  const refreshData = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchRef.current < 2000) return;
    
    setLoading(true);
    lastFetchRef.current = now;
    
    try {
      const [liveMetrics, resNodes] = await Promise.all([
        fetchLiveClimateData(activeCity),
        getLocalRiskAreas(CITY_COORDS[activeCity].lat, CITY_COORDS[activeCity].lng, "heat, flooding, and grid stability")
      ]);
      
      setMetrics(liveMetrics);
      setRiskNodes(resNodes);
      
      const resInsights = await getClimateInsights(activeCity, liveMetrics, DashboardModule.OVERVIEW);
      setInsights(resInsights);
      
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (e) {
      console.error("Dashboard Refresh Error:", e);
    } finally {
      setLoading(false);
    }
  }, [activeCity]);

  useEffect(() => {
    refreshData(true);
  }, [activeCity, refreshData]);

  const renderHome = () => (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-700 pb-32 max-w-[1800px] mx-auto w-full">
      <div className="xl:col-span-8 space-y-8">
        <div className="relative h-[650px] rounded-[70px] overflow-hidden shadow-2xl group bg-slate-950 border border-slate-800">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105 opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <div className="absolute top-12 left-12 flex space-x-6 z-10">
            <div className="bg-emerald-500/20 backdrop-blur-2xl border border-emerald-500/30 px-6 py-3 rounded-2xl flex items-center space-x-3">
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-50 text-[10px] font-black uppercase tracking-[0.2em]">Live Sensor Stream</span>
            </div>
            <div className="bg-blue-500/10 backdrop-blur-2xl border border-blue-500/20 px-6 py-3 rounded-2xl flex items-center space-x-3">
              <ShieldCheck size={14} className="text-blue-400" />
              <span className="text-blue-50 text-[10px] font-black uppercase tracking-[0.2em]">Sentinel-2 Verified</span>
            </div>
          </div>

          <div className="absolute bottom-16 left-16 right-16 flex items-end justify-between z-10">
            <div className="max-w-3xl">
              <div className="flex items-center space-x-6 mb-6">
                <div className="px-5 py-2 bg-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest border border-white/10">Dynamic Resiliency Core</div>
                <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{loading ? 'SYNCING...' : `UPDATED: ${lastUpdated}`}</div>
              </div>
              <h2 className="text-[180px] font-black text-white leading-none tracking-tighter drop-shadow-2xl flex items-baseline">
                {metrics.find(m => m.label.includes('Temp'))?.value || '--'}<span className="text-emerald-500 text-7xl ml-2">°</span>
              </h2>
              <div className="mt-10 flex items-center space-x-16 text-white">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-2">AQI Data</span>
                   <span className="text-5xl font-black tracking-tighter">{metrics.find(m => m.label.includes('AQI'))?.value || '--'}</span>
                </div>
                <div className="w-px h-14 bg-white/20" />
                <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-2">Precipitation</span>
                   <span className="text-5xl font-black tracking-tighter">{metrics.find(m => m.label.includes('Rain'))?.value || '0.0'} mm</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-12 rounded-[56px] shadow-2xl min-w-[380px]">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-10">System Status</p>
              <div className="flex flex-col space-y-10">
                <MiniStat label="Grid Load" value="42%" color="bg-orange-500" />
                <MiniStat label="Network Sync" value="99.2%" color="bg-emerald-500" />
                <MiniStat label="Resilience Cap" value="78%" color="bg-blue-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <TriggerEnginePanel metrics={metrics} />
           <ResponseLibraryPanel insights={insights} />
        </div>
      </div>

      <div className="xl:col-span-4 space-y-8">
        <AIStrategistPanel insights={insights} loading={loading} />
        <ResilienceScorePanel />
        <SyncChartPanel />
      </div>
    </div>
  );

  const renderMap = () => {
    const mapSrc = activeCity === City.SINGAPORE 
      ? 'https://images.unsplash.com/photo-1549608276-5786d7c1e194?auto=format&fit=crop&q=80&w=2000' 
      : 'https://images.unsplash.com/photo-1550133730-695473e544be?auto=format&fit=crop&q=80&w=2000';

    return (
      <div className="animate-in slide-in-from-right-12 duration-700 pb-44 max-w-[1800px] mx-auto w-full">
        <div className="bg-white rounded-[70px] p-6 shadow-2xl border border-slate-100 relative h-[900px] overflow-hidden">
          <div className="absolute inset-6 rounded-[56px] overflow-hidden bg-slate-950 shadow-inner">
             {/* REAL GIS Background simulation */}
             <div 
               className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-[1.02] ${
                 activeLayer === 'thermal' ? 'saturate-200 hue-rotate-[240deg] contrast-150' : 
                 activeLayer === 'precipitation' ? 'grayscale opacity-50 blur-[2px]' : 'saturate-[1.1] contrast-[1.1]'
               }`}
               style={{ backgroundImage: `url(${mapSrc})` }}
             />
             
             {/* Dynamic Data Overlays */}
             {activeLayer === 'thermal' && (
                <div className="absolute inset-0 bg-red-500/10 backdrop-contrast-150 animate-pulse" />
             )}
             {activeLayer === 'precipitation' && (
                <div className="absolute inset-0 bg-blue-900/10 pointer-events-none">
                   <div className="absolute inset-0 opacity-[0.2] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] animate-[scan_3s_linear_infinite]" />
                </div>
             )}

             {/* Scanning Line HUD */}
             <div className="absolute inset-x-0 h-1 bg-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.8)] animate-[scan_10s_linear_infinite]" 
                  style={{ top: '0%' }} />

             {/* Top HUD HUD Overlay */}
             <div className="absolute top-12 left-12 z-[60] bg-slate-950/90 backdrop-blur-3xl border border-white/10 p-10 rounded-[48px] shadow-2xl min-w-[440px]">
                <div className="flex items-center space-x-6 mb-8">
                  <div className="w-16 h-16 bg-emerald-500 rounded-[24px] flex items-center justify-center shadow-lg">
                     <Radio size={32} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-white tracking-tighter uppercase">{activeCity} Urban Matrix</h4>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Source: SENTINEL-2 / LANDSAT-8</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8 py-4 border-t border-white/10">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-[0.3em] mb-1">Resolution</span>
                      <span className="text-2xl font-mono text-white font-black">10m/px</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-[0.3em] mb-1">Active Nodes</span>
                      <span className="text-2xl font-mono text-emerald-400 font-black">{riskNodes?.groundingChunks?.length || 0}</span>
                   </div>
                </div>
                <div className="mt-8 flex space-x-3">
                   <LayerBtn label="Optical" active={activeLayer === 'rgb'} onClick={() => setActiveLayer('rgb')} icon={<Eye size={14} />} />
                   <LayerBtn label="Thermal" active={activeLayer === 'thermal'} onClick={() => setActiveLayer('thermal')} icon={<Thermometer size={14} />} />
                   <LayerBtn label="Precip" active={activeLayer === 'precipitation'} onClick={() => setActiveLayer('precipitation')} icon={<Droplets size={14} />} />
                </div>
             </div>
             
             {loading ? (
               <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-md z-[100]">
                  <div className="flex flex-col items-center">
                    <Loader2 size={80} className="text-emerald-500 animate-spin mb-6" />
                    <span className="text-white text-xs font-black uppercase tracking-[0.5em]">Synchronizing Network Graph</span>
                  </div>
               </div>
             ) : (
               riskNodes?.groundingChunks?.map((chunk: any, i: number) => {
                 const title = chunk.maps?.title || "Urban Point";
                 const type = chunk.maps?.type || "Sensor";
                 const pos = chunk.maps?._pos || [30 + (i * 10), 30 + (i * 8)];
                 const uri = chunk.maps?.uri;

                 return (
                   <div key={i} 
                        className="absolute cursor-pointer group z-30"
                        style={{ top: `${pos[0]}%`, left: `${pos[1]}%` }}
                        onClick={() => uri && window.open(uri, '_blank')}>
                     
                     <div className="relative">
                       <div className="absolute -inset-10 bg-emerald-500/20 rounded-full animate-ping" />
                       <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-[22px] flex items-center justify-center shadow-2xl border-2 border-emerald-500 group-hover:scale-125 transition-all duration-700">
                         {type.includes('Grid') ? <Zap size={28} className="text-emerald-400" /> :
                          type.includes('Hub') ? <Truck size={28} className="text-blue-400" /> :
                          type.includes('Building') ? <Building2 size={28} className="text-orange-400" /> :
                          <Database size={28} className="text-slate-400" />}
                       </div>
                       
                       <div className="absolute top-full left-1/2 -translate-x-1/2 mt-5 bg-slate-950/95 backdrop-blur-2xl text-white px-8 py-4 rounded-[28px] shadow-2xl border border-white/10 whitespace-nowrap opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all translate-y-3 group-hover:translate-y-0 flex flex-col items-center z-[150]">
                          <span className="text-sm font-black tracking-tight mb-1">{title}</span>
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{type} Node</span>
                       </div>
                     </div>
                   </div>
                 );
               })
             )}
             
             {/* Map Controls */}
             <div className="absolute top-12 right-12 flex flex-col space-y-6 z-40">
                <MapTool icon={<Layers size={24} />} active />
                <MapTool icon={<Maximize2 size={24} />} />
                <MapTool icon={<Radio size={24} />} />
             </div>

             <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end z-40">
                <div className="bg-slate-950/90 backdrop-blur-3xl border border-white/10 p-10 rounded-[48px] shadow-2xl flex space-x-16">
                   <div className="flex flex-col border-r border-white/10 pr-16">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-2">Coordination</span>
                      <span className="text-4xl font-black text-white tracking-tighter">99.4%</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-2">Risk Reduction</span>
                      <span className="text-4xl font-black text-emerald-500 tracking-tighter">-42.8%</span>
                   </div>
                </div>
                <div className="bg-emerald-600 px-10 py-6 rounded-[32px] text-white font-black flex items-center space-x-4 shadow-2xl border border-emerald-400/30">
                   <CheckCircle2 size={24} />
                   <span className="text-sm uppercase tracking-[0.2em]">Real-Time Ground-Truth Enabled</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInsights = () => (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 animate-in fade-in duration-700 pb-44 max-w-[1800px] mx-auto w-full">
       <div className="xl:col-span-8 space-y-10">
          <div className="bg-white rounded-[70px] p-20 shadow-2xl border border-slate-50">
             <div className="flex items-center space-x-10 mb-20">
                <div className="w-24 h-24 bg-slate-950 rounded-[32px] flex items-center justify-center shadow-2xl">
                   <Cpu size={48} className="text-emerald-500" />
                </div>
                <div>
                   <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-3">Adaptive Intelligence</h2>
                   <p className="text-md font-bold text-slate-400 uppercase tracking-[0.4em]">Urban Resiliency Coordination Node</p>
                </div>
             </div>
             <div className="space-y-16">
                <section className="bg-slate-50 p-16 rounded-[60px] border-l-[16px] border-emerald-500 shadow-inner relative">
                   <div className="absolute -top-4 -left-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Zap size={24} className="text-emerald-500" />
                   </div>
                   <p className="text-3xl text-slate-700 leading-relaxed font-black italic">
                      "{insights?.summary || "Analyzing synchronization latency across decentralized urban actors..."}"
                   </p>
                </section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   {insights?.recommendations?.map((rec, i) => (
                     <div key={i} className="bg-white border border-slate-100 p-12 rounded-[56px] flex items-start space-x-10 hover:shadow-2xl hover:border-emerald-100 transition-all group">
                        <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-700 font-black text-3xl shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">{i+1}</div>
                        <p className="text-slate-700 font-bold leading-relaxed text-xl">{rec}</p>
                     </div>
                   ))}
                </div>
             </div>
          </div>
       </div>
       <div className="xl:col-span-4 space-y-10">
          <ResilienceScorePanel />
          <div className="bg-slate-950 rounded-[64px] p-12 text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
             <h4 className="text-2xl font-black mb-12 relative z-10 tracking-tight">Sync Reliability</h4>
             <div className="w-full relative z-10 h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={SYNC_DATA}>
                      <defs>
                        <linearGradient id="syncGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" hide />
                      <Area type="monotone" dataKey="sync" stroke="#10b981" strokeWidth={6} fill="url(#syncGrad)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>
       </div>
    </div>
  );

  const renderSensors = () => (
    <div className="space-y-10 animate-in slide-in-from-bottom-12 duration-700 pb-44 max-w-[1800px] mx-auto w-full">
       <div className="bg-white rounded-[70px] p-20 shadow-2xl border border-slate-50">
          <div className="flex items-center justify-between mb-20">
             <div className="flex items-center space-x-10">
                <div className="w-24 h-24 bg-blue-600 rounded-[40px] flex items-center justify-center shadow-2xl shadow-blue-500/30">
                   <Radio size={48} className="text-white" />
                </div>
                <h2 className="text-5xl font-black text-slate-800 tracking-tight">Nodal Telemetry</h2>
             </div>
          </div>
          <div className="overflow-hidden border border-slate-100 rounded-[60px] shadow-sm">
             <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                   <tr>
                      <th className="px-12 py-12 text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Node ID</th>
                      <th className="px-12 py-12 text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Sector</th>
                      <th className="px-12 py-12 text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Modality</th>
                      <th className="px-12 py-12 text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Live Data</th>
                      <th className="px-12 py-12 text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {[
                     { id: `NODE-MAR-01`, loc: 'Marina Hub', type: 'Thermal', val: metrics.find(m => m.label.includes('Temp'))?.value + '°C', status: 'Optimal' },
                     { id: `NODE-CEN-42`, loc: 'Central Corridor', type: 'AQI', val: '42 AQI', status: 'Stable' },
                     { id: `NODE-JUR-91`, loc: 'Logistics Zone', type: 'Water', val: '+0.12m', status: 'Optimal' },
                     { id: `NODE-TUAS-12`, loc: 'Port Authority', type: 'Grid', val: '4.8 GW', status: 'Optimal' },
                   ].map((s, i) => (
                     <tr key={i} className="hover:bg-slate-50/70 transition-all duration-300 group cursor-pointer">
                        <td className="px-12 py-12 font-mono text-sm font-black text-slate-400">{s.id}</td>
                        <td className="px-12 py-12 font-black text-slate-800 text-2xl tracking-tighter">{s.loc}</td>
                        <td className="px-12 py-12">
                           <span className="px-6 py-2 bg-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-500 tracking-widest">{s.type}</span>
                        </td>
                        <td className="px-12 py-12 font-black text-slate-950 text-2xl tracking-tighter">{s.val}</td>
                        <td className="px-12 py-12">
                           <div className="flex items-center space-x-4">
                              <div className={`w-4 h-4 rounded-full ${s.status === 'Warning' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                              <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${s.status === 'Warning' ? 'text-amber-600' : 'text-emerald-600'}`}>{s.status}</span>
                           </div>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans selection:bg-emerald-500 selection:text-white pb-32">
      <header className="px-16 py-12 flex items-center justify-between sticky top-0 bg-[#F8F9FA]/90 backdrop-blur-3xl z-[100] border-b border-slate-100 shadow-sm">
        <div className="flex items-center space-x-12">
           <div className="flex items-center space-x-5 cursor-pointer group" onClick={() => setCurrentView('home')}>
              <div className="w-16 h-16 bg-slate-950 rounded-[24px] flex items-center justify-center shadow-2xl group-hover:bg-emerald-600 group-hover:scale-110 transition-all duration-700">
                 <Activity className="text-emerald-500 group-hover:text-white transition-colors" size={36} />
              </div>
              <div className="hidden md:block">
                 <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">CLIMAX<span className="text-emerald-500">.ai</span></h1>
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">Multi-Hazard Intelligence Hub</p>
              </div>
           </div>
           
           <div className="w-px h-12 bg-slate-200 hidden lg:block" />

           <div className="relative group">
             <button className="flex items-center space-x-6 bg-white border border-slate-200 px-10 py-5 rounded-[36px] text-md font-black text-slate-800 shadow-sm hover:border-emerald-500 hover:shadow-xl transition-all">
               <MapPin size={24} className="text-emerald-500" />
               <span className="tracking-tight">{loading ? 'SYNCING...' : activeCity.toUpperCase()} OPERATIONS</span>
               <ChevronRight size={20} className="text-slate-300 group-hover:rotate-90 transition-transform duration-500" />
             </button>
             <div className="absolute top-full left-0 mt-5 w-80 bg-white border border-slate-100 rounded-[48px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] hidden group-hover:block z-[110] overflow-hidden ring-1 ring-black/5 animate-in fade-in slide-in-from-top-4 duration-500">
               {Object.values(City).map(city => (
                 <button 
                  key={city} 
                  onClick={() => setActiveCity(city)} 
                  disabled={loading}
                  className={`w-full text-left px-12 py-8 text-md font-bold transition-all flex items-center justify-between group/item ${activeCity === city ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50 text-slate-600 disabled:opacity-50'}`}
                >
                   {city}
                   <CheckCircle2 size={20} className={`text-emerald-500 transition-opacity ${activeCity === city ? 'opacity-100' : 'opacity-0 group-hover/item:opacity-50'}`} />
                 </button>
               ))}
             </div>
           </div>
        </div>

        <div className="flex items-center space-x-10">
           <div className="hidden xl:flex items-center bg-white border border-slate-200 rounded-[32px] px-10 py-5 shadow-sm focus-within:ring-8 focus-within:ring-emerald-500/5 focus-within:border-emerald-500 transition-all duration-500">
              <Search size={24} className="text-slate-400 mr-5" />
              <input type="text" placeholder="Scan urban matrix..." className="bg-transparent border-none outline-none text-md font-bold w-80 placeholder:text-slate-300" />
           </div>
           <button onClick={() => refreshData(true)} className="p-5 bg-white border border-slate-200 rounded-[28px] text-slate-400 hover:text-emerald-600 hover:border-emerald-500 transition-all shadow-sm group">
             <RefreshCcw size={28} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-700`} />
           </button>
           <div className="w-16 h-16 rounded-[28px] border-[4px] border-white shadow-2xl overflow-hidden cursor-pointer hover:scale-110 hover:rotate-6 transition-all duration-500 ring-1 ring-slate-100">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeCity}`} alt="User Profile" />
           </div>
        </div>
      </header>

      <main className="px-16 py-16 flex-1 w-full overflow-x-hidden">
        {currentView === 'home' && renderHome()}
        {currentView === 'map' && renderMap()}
        {currentView === 'insights' && renderInsights()}
        {currentView === 'sensors' && renderSensors()}
        {currentView === 'alerts' && (
           <div className="bg-white rounded-[80px] p-40 text-center shadow-2xl border border-slate-100 animate-in fade-in duration-1000 max-w-5xl mx-auto mt-20">
              <div className="w-40 h-40 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-16 shadow-inner animate-pulse">
                 <CheckCircle2 size={80} className="text-emerald-600" />
              </div>
              <h2 className="text-6xl font-black text-slate-800 mb-10 tracking-tight">System Equilibrium</h2>
              <p className="text-slate-500 font-bold max-w-3xl mx-auto leading-relaxed text-2xl">
                 Real-time telemetry confirms <span className="text-emerald-600">zero hazard deviations</span> across the urban coordination grid for {activeCity}. System synchronization is at 100%.
              </p>
           </div>
        )}
      </main>

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[150]">
        <nav className="bg-slate-950/95 backdrop-blur-3xl px-14 py-9 rounded-[64px] flex items-center space-x-24 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] border border-white/10 ring-4 ring-white/5">
          <DockBtn active={currentView === 'home'} onClick={() => setCurrentView('home')} icon={<HomeIcon />} label="Dashboard" />
          <DockBtn active={currentView === 'map'} onClick={() => setCurrentView('map')} icon={<MapIcon />} label="Satellite" />
          <DockBtn active={currentView === 'sensors'} onClick={() => setCurrentView('sensors')} icon={<Radio />} label="Telemetry" />
          <DockBtn active={currentView === 'insights'} onClick={() => setCurrentView('insights')} icon={<LayoutGrid />} label="Strategy" />
          <DockBtn active={currentView === 'alerts'} onClick={() => setCurrentView('alerts')} icon={<Bell />} label="Network" badge={metrics.some(m => m.status !== 'normal')} />
        </nav>
      </div>
    </div>
  );
};

const DockBtn: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string, badge?: boolean }> = ({ active, onClick, icon, label, badge }) => (
  <button onClick={onClick} className={`flex flex-col items-center transition-all duration-500 relative group outline-none ${
    active ? 'text-emerald-500 scale-110' : 'text-slate-500 hover:text-white hover:scale-110'
  }`}>
    <span className="flex-shrink-0 transition-transform duration-300 group-active:scale-90">
      {React.cloneElement(icon as React.ReactElement<any>, { size: 36 })}
    </span>
    <span className={`text-[11px] font-black uppercase tracking-[0.3em] mt-4 transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0'}`}>{label}</span>
    {badge && <div className="absolute top-0 right-2 w-5 h-5 bg-red-500 rounded-full border-[4px] border-slate-950 shadow-lg" />}
    {active && <div className="absolute -bottom-3 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,1)]" />}
  </button>
);

const AIStrategistPanel: React.FC<{ insights: AIInsight | null, loading: boolean }> = ({ insights, loading }) => (
  <div className="bg-white rounded-[64px] p-12 shadow-xl border border-slate-50 relative group">
    <div className="flex items-center space-x-7 mb-10">
      <div className="w-20 h-20 bg-emerald-50 rounded-[32px] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-700">
        <Cpu className="text-emerald-500" size={42} />
      </div>
      <div>
        <h4 className="text-2xl font-black text-slate-800 tracking-tight">AI Strategist</h4>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Resilience Engine Online</p>
      </div>
    </div>
    <div className="space-y-12">
       <div className="bg-slate-50 p-12 rounded-[52px] border-l-[12px] border-emerald-500 shadow-inner">
          <p className="text-[17px] text-slate-600 leading-relaxed font-black italic">
            "{insights?.summary || (loading ? "Synthesizing urban telemetry..." : "Standby for sector scan")}"
          </p>
       </div>
       <div className="space-y-6">
          {insights?.recommendations?.slice(0, 3).map((rec, i) => (
            <div key={i} className="flex items-start space-x-8 p-7 rounded-[42px] bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-2xl transition-all duration-500 group">
               <div className="w-12 h-12 rounded-[18px] bg-emerald-50 flex items-center justify-center flex-shrink-0 text-sm font-black text-emerald-600 shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors">{i+1}</div>
               <p className="text-sm font-black text-slate-700 leading-snug tracking-tight">{rec}</p>
            </div>
          ))}
       </div>
    </div>
  </div>
);

const TriggerEnginePanel: React.FC<{ metrics: ClimateMetric[] }> = ({ metrics }) => {
  const rain = parseFloat(metrics.find(m => m.label.includes('Rain'))?.value?.toString() || '0');
  const temp = parseFloat(metrics.find(m => m.label.includes('Temp'))?.value?.toString() || '31');
  const heatStress = Math.min(100, (temp - 25) * 8);
  const rainStress = Math.min(100, rain * 50);
  const compoundRisk = Math.floor((heatStress * 0.4) + (rainStress * 0.6));

  return (
    <section className="bg-white rounded-[64px] p-12 shadow-xl border border-slate-50 flex flex-col h-full min-h-[480px]">
       <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-5">
             <AlertTriangle className="text-orange-500" size={32} />
             <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Trigger Engine</h3>
          </div>
          <span className="px-4 py-2 bg-orange-50 text-orange-600 rounded-xl text-[10px] font-black uppercase tracking-widest">THRESHOLD: 75%</span>
       </div>
       <div className="flex-1 flex flex-col justify-center relative">
          <div className="flex justify-between items-end mb-16">
             <div className="text-center flex-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Heat x Grid</span>
                <span className="text-4xl font-black text-slate-900 tracking-tighter">{Math.floor(heatStress)}%</span>
             </div>
             <div className="w-px h-16 bg-slate-100" />
             <div className="text-center flex-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Rain x Transport</span>
                <span className="text-4xl font-black text-slate-900 tracking-tighter">{Math.floor(rainStress)}%</span>
             </div>
          </div>
          <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden mb-8 shadow-inner">
             <div className={`h-full transition-all duration-1000 ${compoundRisk > 70 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${compoundRisk}%` }} />
          </div>
          <div className="flex justify-between items-center bg-slate-50 p-8 rounded-[40px] border border-slate-100">
             <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Compound Risk</span>
                <span className="text-4xl font-black text-slate-900 tracking-tighter">{compoundRisk} / 100</span>
             </div>
             <div className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${compoundRisk > 60 ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                {compoundRisk > 70 ? 'THRESHOLD REACHED' : 'NOMINAL SYNC'}
             </div>
          </div>
       </div>
    </section>
  );
};

const ResponseLibraryPanel: React.FC<{ insights: AIInsight | null }> = ({ insights }) => (
  <section className="bg-white rounded-[64px] p-12 shadow-xl border border-slate-50 flex flex-col h-full min-h-[480px]">
    <div className="flex items-center justify-between mb-12">
       <div className="flex items-center space-x-5">
          <ShieldCheck className="text-emerald-500" size={32} />
          <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Institutional Response</h3>
       </div>
    </div>
    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
       {insights?.recommendations?.map((rec, i) => (
          <div key={i} className="flex items-center justify-between p-7 rounded-[36px] border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/10 transition-all group">
             <div className="flex items-center space-x-6">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-emerald-500 transition-colors">
                   <Zap size={24} className="text-emerald-500 group-hover:text-white" />
                </div>
                <div>
                   <h4 className="font-black text-slate-800 text-lg leading-tight tracking-tight">{rec.split(':')[0]}</h4>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Dampening: 14%</p>
                </div>
             </div>
             <div className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                Trigger
             </div>
          </div>
       ))}
    </div>
  </section>
);

const ResilienceScorePanel = () => (
  <div className="bg-emerald-500 rounded-[70px] p-16 text-white shadow-2xl relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-16 opacity-10 group-hover:scale-150 transition-transform duration-1000 rotate-12">
       <Zap size={250} />
    </div>
    <h3 className="text-3xl font-black mb-14 relative z-10 tracking-tight">Sync Integrity</h3>
    <div className="space-y-14 relative z-10">
      <ScoreBar label="Grid Latency Sync" value="94%" valText="OPTIMAL" />
      <ScoreBar label="Institutional Coupling" value="82%" valText="SECURE" />
      <ScoreBar label="Node Buffer Capacity" value="75%" valText="NOMINAL" />
    </div>
    <div className="mt-16 p-12 bg-white/10 rounded-[56px] border border-white/10 italic text-md font-black leading-relaxed opacity-95 relative z-10">
      "Full synchronization established: Decentralized urban agents are currently offsetting predicted anomalies."
    </div>
  </div>
);

const SyncChartPanel = () => (
  <div className="bg-white rounded-[64px] p-10 shadow-xl border border-slate-50 relative group h-[350px]">
    <div className="flex items-center justify-between mb-8">
       <div className="flex items-center space-x-4">
          <TrendingUp className="text-blue-500" size={24} />
          <h4 className="text-xl font-black text-slate-800 tracking-tight uppercase">Stress Dampening</h4>
       </div>
    </div>
    <div className="flex-1 w-full h-[220px]">
       <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={SYNC_DATA}>
             <defs>
               <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                 <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
               </linearGradient>
             </defs>
             <XAxis dataKey="time" hide />
             <Area type="monotone" dataKey="stress" stroke="#3b82f6" strokeWidth={5} fill="url(#stressGrad)" />
          </AreaChart>
       </ResponsiveContainer>
    </div>
    <div className="absolute bottom-10 left-10 right-10 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
       <span>Peak Offset: -24.8%</span>
       <span>Load: STABLE</span>
    </div>
  </div>
);

const ScoreBar: React.FC<{ label: string, value: string, valText: string }> = ({ label, value, valText }) => (
  <div>
    <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.4em] mb-5 opacity-90">
      <span>{label}</span>
      <span>{valText}</span>
    </div>
    <div className="w-full h-4 bg-black/20 rounded-full overflow-hidden shadow-inner p-1">
      <div className="h-full bg-white rounded-full transition-all duration-1000 ease-out" style={{ width: value }} />
    </div>
  </div>
);

const MiniStat: React.FC<{ label: string, value: string, color: string }> = ({ label, value, color }) => (
  <div className="group/stat">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-3 group-hover/stat:text-white/80 transition-colors">
       <span>{label}</span>
       <span>{value}</span>
    </div>
    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden shadow-inner p-0.5">
       <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: value }} />
    </div>
  </div>
);

const MapTool: React.FC<{ icon: React.ReactNode, active?: boolean }> = ({ icon, active }) => (
  <button className={`p-6 rounded-[32px] backdrop-blur-3xl border transition-all duration-500 hover:scale-110 active:scale-90 ${
    active ? 'bg-emerald-500 text-white border-emerald-400 shadow-2xl shadow-emerald-500/30' : 'bg-white/10 text-white/60 border-white/10 hover:bg-white/20 hover:text-white hover:border-white/30'
  }`}>
    {icon}
  </button>
);

const LayerBtn: React.FC<{ label: string, active: boolean, onClick: () => void, icon: React.ReactNode }> = ({ label, active, onClick, icon }) => (
  <button onClick={onClick} className={`px-5 py-2.5 rounded-2xl flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest transition-all ${
    active ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
  }`}>
    {icon}
    <span>{label}</span>
  </button>
);

export default App;
