import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Maximize2, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Clock,
  HeartPulse,
  Building2,
  Activity,
  FolderOpen
} from 'lucide-react';

interface TableauViewProps {
  onNavigateTab?: (tab: 'analysis' | 'tableau' | 'knime' | 'finder') => void;
}

export const TableauView: React.FC<TableauViewProps> = ({ onNavigateTab: _onNavigateTab }) => {
  const configuredUrl = (import.meta.env.VITE_TABLEAU_DASHBOARD_URL || '').trim();

  // Active dashboard tab index
  const [activeDashIndex, setActiveDashIndex] = useState<number>(0);
  
  // View mode: 'photo' (default high-DPI 2K photo view) vs 'vector' (live vector breakdown)
  const [viewMode, setViewMode] = useState<'photo' | 'vector'>('photo');
  
  // Modal image for full-screen inspection
  const [modalImage, setModalImage] = useState<string | null>(null);

  // Sheet Directory Accordion State (matching user's screenshot)
  const [selectedSheetCategory, setSelectedSheetCategory] = useState<'all' | 'kpi' | 'chart' | 'dashboard'>('all');
  const [expandedSheetId, setExpandedSheetId] = useState<string | null>(null);

  // 4 Verified Dashboards from Book3.twb with Enhanced HD 2K Renders
  const dashboards = [
    {
      id: 'smart-emergency',
      name: 'DASHBOARD - Smart Emergency Hospital Analytics',
      tabLabel: 'Smart Emergency Analytics',
      tagline: 'Master Executive Suite: 6 KPIs, Hospital Volume Rankings, Bed Occupancy, Treemap & Risk Matrix',
      image: '/assets/tableau_smart_emergency_hd.png?v=4',
      kpis: [
        { label: 'Total Hospitals', val: '10,000', sub: 'Across 28 States & UTs', icon: Building2, color: 'text-blue-600 dark:text-blue-400' },
        { label: 'Total Beds', val: '34,64,528', sub: '34.6 Lakh Inpatient Beds', icon: HeartPulse, color: 'text-indigo-600 dark:text-indigo-400' },
        { label: 'Avg Bed Occupancy', val: '71.43%', sub: 'Target Threshold < 85%', icon: Activity, color: 'text-emerald-600 dark:text-emerald-400' },
        { label: 'Total ICU Beds', val: '3,00,763', sub: '8.68% Intensive Care Ratio', icon: ShieldAlert, color: 'text-amber-600 dark:text-amber-400' },
        { label: 'Emergency Ready', val: '81.86%', sub: 'Triage & Trauma Ready', icon: Clock, color: 'text-violet-600 dark:text-violet-400' },
        { label: 'Avg Hospital Rating', val: '3.99 / 5.0', sub: 'Clinical Quality Score', icon: Sparkles, color: 'text-rose-600 dark:text-rose-400' },
      ],
      stateRankings: [
        { state: 'Gujarat', count: 3411, pct: 34.1, beds: '11,96,866 Beds' },
        { state: 'Telangana', count: 872, pct: 8.7, beds: '2,78,142 Beds' },
        { state: 'West Bengal', count: 860, pct: 8.6, beds: '2,82,410 Beds' },
        { state: 'Delhi', count: 855, pct: 8.6, beds: '2,93,515 Beds' },
        { state: 'Madhya Pradesh', count: 847, pct: 8.5, beds: '2,69,930 Beds' },
        { state: 'Maharashtra', count: 808, pct: 8.1, beds: '2,80,120 Beds' },
        { state: 'Tamil Nadu', count: 807, pct: 8.1, beds: '2,75,410 Beds' },
      ],
      categoryOccupancy: [
        { name: 'Trust Hospitals', occ: 71.67, totalBeds: '8,79,147 Beds' },
        { name: 'Charitable Hospitals', occ: 71.62, totalBeds: '8,44,295 Beds' },
        { name: 'Government Hospitals', occ: 71.22, totalBeds: '8,76,166 Beds' },
        { name: 'Private Hospitals', occ: 71.22, totalBeds: '8,64,920 Beds' },
      ],
      capacityTiers: [
        { level: 'High Capacity', pct: 58.9, count: 5890, desc: 'Normal load, adequate bed reserves (>30% free)', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
        { level: 'Moderate Capacity', pct: 29.6, count: 2962, desc: 'Elevated load, manageable surge margin', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' },
        { level: 'Critical Surge', pct: 11.5, count: 1148, desc: 'Heavy saturation (>85% load), triage diversion active', color: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30' },
      ]
    },
    {
      id: 'capacity-icu',
      name: 'DASHBOARD - Capacity & ICU Analysis',
      tabLabel: 'Capacity & ICU Analysis',
      tagline: 'Inpatient & Critical Care: ICU Bed Allocations, Ownership Tiers, and Regional Bed Capacity',
      image: '/assets/tableau_capacity_icu_hd.png?v=4',
      kpis: [
        { label: 'Total ICU Beds', val: '3,00,763', sub: 'Across All 4 Categories', icon: ShieldAlert, color: 'text-amber-600 dark:text-amber-400' },
        { label: 'ICU Occupied', val: '2,12,593', sub: '60.88% Average ICU Load', icon: Activity, color: 'text-rose-600 dark:text-rose-400' },
        { label: 'ICU Available', val: '88,170', sub: 'Available for Emergency Surge', icon: Activity, color: 'text-emerald-600 dark:text-emerald-400' },
        { label: 'Top Bed Reserve', val: 'Gujarat (11.96L)', sub: '34.5% of National Capacity', icon: Building2, color: 'text-indigo-600 dark:text-indigo-400' },
      ],
      icuBreakdown: [
        { category: 'Trust', icuTotal: '77,878 Beds', icuOcc: '60.8%', generalBeds: '8,79,147' },
        { category: 'Government', icuTotal: '76,079 Beds', icuOcc: '60.9%', generalBeds: '8,76,166' },
        { category: 'Private', icuTotal: '74,265 Beds', icuOcc: '60.9%', generalBeds: '8,64,920' },
        { category: 'Charitable', icuTotal: '72,541 Beds', icuOcc: '60.8%', generalBeds: '8,44,295' },
      ]
    },
    {
      id: 'emergency-response',
      name: 'DASHBOARD - Emergency & Response',
      tabLabel: 'Emergency & Response',
      tagline: 'Triage Dynamics: Wait Times vs Ambulance Response, Caseloads, and Clinical Units',
      image: '/assets/tableau_emergency_response_hd.png?v=4',
      kpis: [
        { label: 'Daily ER Cases', val: '6,63,000+', sub: 'National Daily Emergency Intake', icon: Activity, color: 'text-blue-600 dark:text-blue-400' },
        { label: 'Avg ER Wait Time', val: '38.4 Mins', sub: 'Triage to Treatment Initiation', icon: Clock, color: 'text-amber-600 dark:text-amber-400' },
        { label: 'Avg Ambulance Time', val: '22.6 Mins', sub: 'Call Dispatch to Arrival', icon: Sparkles, color: 'text-emerald-600 dark:text-emerald-400' },
        { label: 'Clinical Readiness', val: '81.86%', sub: 'Staff & Facility Index', icon: Activity, color: 'text-violet-600 dark:text-violet-400' },
      ],
      casesByType: [
        { type: 'Multispeciality', cases: '1,71,287 Cases', pct: 25.8 },
        { type: 'General Emergency', cases: '1,68,761 Cases', pct: 25.4 },
        { type: 'Super Speciality', cases: '1,63,551 Cases', pct: 24.7 },
        { type: 'Trauma Center Care', cases: '1,59,401 Cases', pct: 24.1 },
      ],
      facilityReadiness: [
        { name: '24x7 Emergency Services', pct: 85.1 },
        { name: 'Ambulance Units Active', pct: 82.2 },
        { name: 'Trauma Center Certified', pct: 78.4 },
        { name: 'Cardiology Support Unit', pct: 74.3 },
        { name: 'Neurology Emergency Unit', pct: 71.8 },
      ]
    },
    {
      id: 'geographic-overview',
      name: 'DASHBOARD - Geographic Overview',
      tabLabel: 'Geographic Overview',
      tagline: 'Pan-India GIS: Cluster Mapping, State Concentrations, and Top Metropolitan Hubs',
      image: '/assets/tableau_geographic_overview_hd.png?v=4',
      kpis: [
        { label: 'Mapped Coordinates', val: '10,000 Points', sub: 'Lat/Long Geographic Extract', icon: Activity, color: 'text-blue-600 dark:text-blue-400' },
        { label: 'Top Metro Hub', val: 'Delhi (695)', sub: '6.95% City Density', icon: Building2, color: 'text-indigo-600 dark:text-indigo-400' },
        { label: 'Financial Hub', val: 'Mumbai (694)', sub: '6.94% City Density', icon: Building2, color: 'text-emerald-600 dark:text-emerald-400' },
        { label: 'Leading State', val: 'Gujarat (3,411)', sub: '34.1% National Concentration', icon: Building2, color: 'text-amber-600 dark:text-amber-400' },
      ],
      topCities: [
        { city: 'Delhi', count: 695, pct: 6.95 },
        { city: 'Mumbai', count: 694, pct: 6.94 },
        { city: 'Gandhinagar', count: 693, pct: 6.93 },
        { city: 'Pune', count: 691, pct: 6.91 },
        { city: 'Ahmedabad', count: 682, pct: 6.82 },
        { city: 'Kolkata', count: 676, pct: 6.76 },
        { city: 'Bangalore', count: 665, pct: 6.65 },
      ]
    }
  ];

  // Complete 22 Sheets & Dashboards from Book3.twb (matching screenshot 1)
  const allSheets = [
    // KPIs (6)
    { 
      id: 'kpi-1', 
      name: 'KPI - Total Hospitals', 
      category: 'kpi', 
      type: 'Scorecard', 
      measure: 'COUNT([Hospital_ID])', 
      result: '10,000 Hospitals',
      desc: 'Overall hospital volume extracted from 28 states & union territories across India.'
    },
    { 
      id: 'kpi-2', 
      name: 'KPI - Total Beds', 
      category: 'kpi', 
      type: 'Scorecard', 
      measure: 'SUM([Total_Beds])', 
      result: '34,64,528 Beds',
      desc: 'Cumulative inpatient bed inventory across all clinical care tiers.'
    },
    { 
      id: 'kpi-3', 
      name: 'KPI - Avg Bed Occupancy', 
      category: 'kpi', 
      type: 'Scorecard', 
      measure: 'AVG([Bed_Occupancy_Pct])', 
      result: '71.43%',
      desc: 'National average inpatient bed occupancy percentage (safe operating margin).'
    },
    { 
      id: 'kpi-4', 
      name: 'KPI - ICU Capacity', 
      category: 'kpi', 
      type: 'Scorecard', 
      measure: 'SUM([ICU_Total_Beds])', 
      result: '3,00,763 ICU Beds',
      desc: 'Dedicated critical care and ventilator-equipped bed capacity.'
    },
    { 
      id: 'kpi-5', 
      name: 'KPI - Emergency Ready', 
      category: 'kpi', 
      type: 'Scorecard', 
      measure: 'AVG([Staff_Availability_Pct] * Readiness)', 
      result: '81.86%',
      desc: 'Composite operational readiness index combining triage staff and 24x7 coverage.'
    },
    { 
      id: 'kpi-6', 
      name: 'KPI - Avg Rating', 
      category: 'kpi', 
      type: 'Scorecard', 
      measure: 'AVG([Hospital_Rating])', 
      result: '3.99 / 5.0',
      desc: 'Clinical quality score and patient feedback rating aggregate.'
    },
    
    // Analytical Charts (12)
    { 
      id: 'chart-1', 
      name: 'HOSPITALS BY STATE (VOLUME RANKING)', 
      category: 'chart', 
      type: 'Bar Chart', 
      measure: 'COUNT([Hospital_ID]) by [State]', 
      result: 'Gujarat (3,411), Telangana (872), WB (860), Delhi (855)',
      desc: 'State volume ranking identifying regional healthcare density hubs.'
    },
    { 
      id: 'chart-2', 
      name: 'AVERAGE BED OCCUPANCY BY HOSPITAL CATEGORY', 
      category: 'chart', 
      type: 'Bar Chart', 
      measure: 'AVG([Bed_Occupancy_Pct]) by [Hospital_Category]', 
      result: 'Trust: 71.67%, Charitable: 71.62%, Govt: 71.22%, Private: 71.22%',
      desc: 'Occupancy benchmark demonstrating consistent 71% load across ownership structures.'
    },
    { 
      id: 'chart-3', 
      name: 'EMERGENCY CAPACITY TIER DISTRIBUTION (TREEMAP)', 
      category: 'chart', 
      type: 'Treemap', 
      measure: 'COUNT([Hospital_ID]) by [Emergency_Capacity_Level]', 
      result: 'High (58.9%), Moderate (29.6%), Critical (11.5%)',
      desc: 'Categorizes hospital facilities into triage capacity surge risk tiers.'
    },
    { 
      id: 'chart-4', 
      name: 'HOSPITAL BED CAPACITY (OCCUPIED VS AVAILABLE)', 
      category: 'chart', 
      type: 'Stacked Bar', 
      measure: 'SUM([Occupied_Beds]) vs SUM([Available_Beds])', 
      result: '24,79,609 Occupied (71.6%) vs 9,84,919 Available (28.4%)',
      desc: 'Capacity buffer showing available bed reserves for disaster surge management.'
    },
    { 
      id: 'chart-5', 
      name: 'EMERGENCY & ICU CAPACITY RISK MATRIX (HEATMAP)', 
      category: 'chart', 
      type: 'Heatmap', 
      measure: '[Emergency_Load_Pct] vs [Bed_Occupancy_Pct]', 
      result: 'Critical (1,148), High (5,890), Moderate (2,962)',
      desc: 'Multi-factor operational risk matrix grouping facilities into emergency triage risk quadrants.'
    },
    { 
      id: 'chart-6', 
      name: 'ICU CAPACITY & OCCUPIED BEDS', 
      category: 'chart', 
      type: 'Horizontal Bar', 
      measure: 'SUM([ICU_Total_Beds]), SUM([ICU_Occupied_Beds])', 
      result: 'Trust: 77.8k, Govt: 76.0k, Private: 74.2k, Charitable: 72.5k',
      desc: 'Distribution of intensive care units across hospital management models.'
    },
    { 
      id: 'chart-7', 
      name: 'STATE BED CAPACITY BENCHMARK', 
      category: 'chart', 
      type: 'Bar Chart', 
      measure: 'SUM([Total_Beds]) by [State]', 
      result: 'Gujarat: 11.96L, Delhi: 2.93L, West Bengal: 2.82L',
      desc: 'Total regional bed capacity comparison across top Indian states.'
    },
    { 
      id: 'chart-8', 
      name: 'EMERGENCY WAIT TIME VS RESPONSE TIME (SCATTER PLOT)', 
      category: 'chart', 
      type: 'Scatter Plot', 
      measure: '[Estimated_Wait_Min] vs [Average_Response_Time_Min]', 
      result: 'Mean Wait: 38.4m | Mean Response: 22.6m',
      desc: 'Correlation scatter evaluating ambulance dispatch response vs ER waiting times.'
    },
    { 
      id: 'chart-9', 
      name: 'DAILY EMERGENCY CASES BY CARE TYPE', 
      category: 'chart', 
      type: 'Bar Chart', 
      measure: 'SUM([Daily_Emergency_Cases]) by [Hospital_Care_Type]', 
      result: 'Multispeciality (1.71L), General (1.68L), Super (1.63L)',
      desc: 'Case intake volume breakdown by clinical specialty and care classification.'
    },
    { 
      id: 'chart-10', 
      name: 'CLINICAL FACILITY & STAFF READINESS', 
      category: 'chart', 
      type: 'Progress Bar', 
      measure: '% Yes for [Ambulance, Trauma, Cardiology, Neurology, 24x7]', 
      result: '24x7 (85.1%), Ambulance (82.2%), Trauma (78.4%)',
      desc: 'Readiness evaluation of life-saving equipment and specialized emergency wings.'
    },
    { 
      id: 'chart-11', 
      name: 'TOP METRO CITIES BY HOSPITAL VOLUME', 
      category: 'chart', 
      type: 'Horizontal Bar', 
      measure: 'COUNT([Hospital_ID]) by [City]', 
      result: 'Delhi (695), Mumbai (694), Gandhinagar (693), Pune (691)',
      desc: 'Metropolitan concentration analysis ranking top Indian cities by hospital volume.'
    },
    { 
      id: 'chart-12', 
      name: 'PAN-INDIA HOSPITAL GEOGRAPHIC DISTRIBUTION', 
      category: 'chart', 
      type: 'Geographic Map', 
      measure: 'AVG([Latitude]), AVG([Longitude]) marked by [Facility_Count]', 
      result: 'Pan-India 10,000 Geographic Coordinates',
      desc: 'GIS geospatial plot visualizing hospital clusters across urban and rural corridors.'
    },

    // Dashboards (4)
    { 
      id: 'dash-1', 
      name: 'DASHBOARD - Smart Emergency Hospital Analytics', 
      category: 'dashboard', 
      type: 'Executive Suite', 
      measure: '12 Combined Visual Elements & KPIs', 
      result: 'Master Suite: 6 KPIs, State Rankings, Treemap, Risk Matrix',
      desc: 'Primary executive dashboard combining high-level KPIs with detailed operational breakdowns.'
    },
    { 
      id: 'dash-2', 
      name: 'DASHBOARD - Capacity & ICU Analysis', 
      category: 'dashboard', 
      type: 'Inpatient Analytics', 
      measure: '4 ICU & Bed Capacity Visuals', 
      result: 'ICU Beds by Category, State Bed Comparison, Occupancy',
      desc: 'Specialized inpatient capacity benchmarking comparing ICU allocations and regional reserves.'
    },
    { 
      id: 'dash-3', 
      name: 'DASHBOARD - Emergency & Response', 
      category: 'dashboard', 
      type: 'Triage Dynamics', 
      measure: '4 Triage & Clinical Elements', 
      result: 'Wait vs Response Scatter, Daily Cases, Facility Readiness',
      desc: 'Triage queue analysis comparing ambulance response times, emergency intake, and clinical units.'
    },
    { 
      id: 'dash-4', 
      name: 'DASHBOARD - Geographic Overview', 
      category: 'dashboard', 
      type: 'Spatial Network', 
      measure: '3 GIS & Density Elements', 
      result: 'Pan-India GIS Coordinates, State Rankings, Top Metro Cities',
      desc: 'Geospatial mapping plotting 10,000 hospital coordinates, state volumes, and metro city hubs.'
    }
  ];

  const filteredSheets = allSheets.filter(s => {
    if (selectedSheetCategory === 'all') return true;
    return s.category === selectedSheetCategory;
  });

  const activeDash = dashboards[activeDashIndex];

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6 animate-in fade-in duration-200">
      
      {/* ================= COMPACT HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <LayoutDashboard className="w-3 h-3 mr-1 text-indigo-600 dark:text-indigo-400" />
              Tableau Analytics
            </span>
            <span className="text-xs text-slate-500 font-mono">Book3.twb • 10,000 Records</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">
            Healthcare Emergency Dashboards
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          {configuredUrl && (
            <a
              href={configuredUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
            >
              <span>Open in Tableau Public</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <span className="text-[11px] text-slate-500 font-medium px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">
            Author: Dhruvraj Rathod
          </span>
        </div>
      </div>

      {/* ================= DASHBOARD SELECTOR & PRESENTATION MODE ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        
        {/* Dashboard Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          {dashboards.map((dash, idx) => (
            <button
              key={dash.id}
              type="button"
              onClick={() => setActiveDashIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeDashIndex === idx
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {dash.tabLabel}
            </button>
          ))}
        </div>

        {/* View Mode Toggle: Photo View by default */}
        <div className="flex items-center space-x-1 p-1 rounded-lg bg-slate-200/80 dark:bg-slate-800 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('photo')}
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
              viewMode === 'photo'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Dashboard Photo View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('vector')}
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
              viewMode === 'vector'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Interactive Vector View</span>
          </button>
        </div>
      </div>

      {/* ================= PHOTO VIEW (DEFAULT HIGH-RESOLUTION DASHBOARD) ================= */}
      {viewMode === 'photo' ? (
        <section className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs space-y-4">
          
          {/* Dashboard Header Bar */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {activeDash.name}
              </h2>
              <p className="text-[11px] text-slate-500">
                Ultra-High-Resolution 2K Dashboard Capture • Clean Frame View (Click image to zoom full screen)
              </p>
            </div>

            <button
              type="button"
              onClick={() => setModalImage(activeDash.image)}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer shrink-0"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Zoom Fullscreen</span>
            </button>
          </div>

          {/* High-Resolution Clean Image Box */}
          <div className="p-2.5 sm:p-4 bg-slate-50/80 dark:bg-slate-950/40">
            <div 
              onClick={() => setModalImage(activeDash.image)}
              className="relative group cursor-zoom-in rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center"
            >
              <img
                src={activeDash.image}
                alt={activeDash.name}
                className="w-full h-auto max-h-[720px] object-contain transition-transform duration-200 group-hover:scale-[1.002] select-none"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />

              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/85 backdrop-blur-md text-white text-xs font-semibold flex items-center space-x-1.5 opacity-90 group-hover:opacity-100 transition shadow-sm">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Zoom Fullscreen (3K HD)</span>
              </div>
            </div>

            {/* Key KPI Scorecards extracted from the Dashboard */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {activeDash.kpis.map((kpi, i) => {
                const IconComponent = kpi.icon;
                return (
                  <div 
                    key={i} 
                    className="p-3 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs text-center"
                  >
                    <div className="flex items-center justify-center space-x-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      <IconComponent className={`w-3.5 h-3.5 ${kpi.color}`} />
                      <span className="truncate">{kpi.label}</span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                      {kpi.val}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {kpi.sub}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </section>
      ) : (
        /* INTERACTIVE VECTOR VIEW (Alternative detailed breakdown) */
        <div className="space-y-4">
          <div className="px-1 text-xs text-slate-500 dark:text-slate-400">
            {activeDash.tagline}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {activeDash.kpis.map((kpi, i) => {
              const IconComponent = kpi.icon;
              return (
                <div 
                  key={i} 
                  className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-800 transition"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                      {kpi.label}
                    </span>
                    <IconComponent className={`w-3.5 h-3.5 shrink-0 ${kpi.color}`} />
                  </div>
                  <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {kpi.val}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {kpi.sub}
                  </div>
                </div>
              );
            })}
          </div>

          {activeDashIndex === 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-5 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Hospitals by State (Volume Ranking)
                </h3>
                <div className="space-y-2.5">
                  {activeDash.stateRankings?.map((st, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{st.state}</span>
                        <span className="font-mono text-slate-600 dark:text-slate-400">
                          {st.count.toLocaleString()} ({st.pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                          style={{ width: `${(st.count / 3411) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Bed Occupancy by Category
                </h3>
                <div className="space-y-3">
                  {activeDash.categoryOccupancy?.map((cat, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                        <span>{cat.name}</span>
                        <span className="font-mono text-slate-900 dark:text-white">{cat.occ}%</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{cat.totalBeds}</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Stable</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Capacity Tier Distribution
                </h3>
                <div className="space-y-2">
                  {activeDash.capacityTiers?.map((tier, i) => (
                    <div key={i} className={`p-2.5 rounded-lg border text-xs ${tier.color}`}>
                      <div className="flex items-center justify-between font-bold">
                        <span>{tier.level}</span>
                        <span className="font-mono">{tier.pct}%</span>
                      </div>
                      <div className="text-[11px] opacity-80 mt-0.5">
                        {tier.count.toLocaleString()} Hospitals
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TABLEAU SHEETS & DASHBOARDS DIRECTORY (MATCHING USER SCREENSHOT 1) ================= */}
      <section className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        
        {/* Section Header */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Tableau Sheets & Dashboards Directory (22 Sheets)
                </h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  Book3.twb
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Browse all sheets, KPIs, and charts used across the 4 dashboards.
              </p>
            </div>
          </div>

          {/* Category Filter Pills (matching screenshot 1) */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setSelectedSheetCategory('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                selectedSheetCategory === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              All (22)
            </button>
            <button
              type="button"
              onClick={() => setSelectedSheetCategory('kpi')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                selectedSheetCategory === 'kpi'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              KPI Scorecards (6)
            </button>
            <button
              type="button"
              onClick={() => setSelectedSheetCategory('chart')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                selectedSheetCategory === 'chart'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Analytical Charts (12)
            </button>
            <button
              type="button"
              onClick={() => setSelectedSheetCategory('dashboard')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                selectedSheetCategory === 'dashboard'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Dashboards (4)
            </button>
          </div>
        </div>

        {/* 2-Column Accordion Cards Grid (matching screenshot 1) */}
        <div className="p-4 bg-white dark:bg-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredSheets.map((sheet) => {
              const isExpanded = expandedSheetId === sheet.id;
              return (
                <div
                  key={sheet.id}
                  className={`rounded-xl border transition-all cursor-pointer ${
                    isExpanded
                      ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                  onClick={() => setExpandedSheetId(isExpanded ? null : sheet.id)}
                >
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 truncate pr-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {sheet.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {sheet.type}
                        </div>
                      </div>
                    </div>

                    <div className="text-slate-400 shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs space-y-2">
                      <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 font-mono text-[11px] text-indigo-700 dark:text-indigo-300">
                        <code>Formula: {sheet.measure}</code>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300">
                        <span>Calculated Output:</span>
                        <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{sheet.result}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {sheet.desc}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </section>

      {/* ================= FULLSCREEN MODAL ================= */}
      {modalImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setModalImage(null)}
        >
          <div 
            className="relative max-w-7xl max-h-[94vh] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-white">
                Tableau Desktop Dashboard (Ultra-High 3K Resolution • Book3.twb)
              </span>
              <button
                type="button"
                onClick={() => setModalImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-auto p-3 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
              <img 
                src={modalImage} 
                alt="Tableau Dashboard Full View" 
                className="max-w-full max-h-[85vh] object-contain rounded shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
