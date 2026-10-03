import React, { useState } from 'react';
import {
  MapPin,
  Bed,
  HeartPulse,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  Map,
  ArrowRight,
  ShieldCheck,
  Check,
  Plus,
  Ambulance,
} from 'lucide-react';
import { Hospital } from '../types';

interface HospitalCardProps {
  hospital: Hospital;
  isSelected?: boolean;
  isHovered?: boolean;
  isCompared?: boolean;
  isDispatched?: boolean;
  hasActiveDispatch?: boolean;
  onSelect: (hospital: Hospital) => void;
  onShowOnMap: (hospital: Hospital) => void;
  onToggleCompare: (hospital: Hospital) => void;
  onSelectAndDispatch?: (hospital: Hospital) => void;
  onHover?: (hospitalId: string | null) => void;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({
  hospital,
  isSelected,
  isHovered,
  isCompared,
  isDispatched,
  hasActiveDispatch,
  onSelect,
  onShowOnMap,
  onToggleCompare,
  onSelectAndDispatch,
  onHover,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const score = hospital.suitability_score || 75;
  const icuAvailable = hospital.ICU_Available_Beds || 0;
  const bedsAvailable = hospital.Available_Beds || 0;

  // Semantic status indicators: Green (available), Amber (limited), Red (critical/low)
  const icuStatusColor =
    icuAvailable > 5
      ? 'text-emerald-600 dark:text-emerald-400'
      : icuAvailable > 0
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-rose-600 dark:text-rose-400';

  const bedsStatusColor =
    bedsAvailable > 15
      ? 'text-emerald-600 dark:text-emerald-400'
      : bedsAvailable > 0
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-rose-600 dark:text-rose-400';

  return (
    <article
      onMouseEnter={() => onHover && onHover(hospital.Hospital_ID)}
      onMouseLeave={() => onHover && onHover(null)}
      className={`group rounded-xl border p-4 bg-white dark:bg-slate-900 transition-all duration-200 cursor-pointer ${
        isDispatched
          ? 'border-emerald-500 ring-2 ring-emerald-500/25 bg-emerald-50/10 dark:bg-emerald-950/20 shadow-md'
          : isSelected
          ? 'border-teal-600 ring-2 ring-teal-500/20 shadow-md'
          : isHovered
          ? 'border-slate-300 dark:border-slate-600 shadow-md -translate-y-0.5'
          : 'border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 hover:shadow-sm'
      }`}
      onClick={() => onSelect(hospital)}
    >
      {/* 1. Header: Hospital Name, Category, Distance, and Suitability Score */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5 flex-1 min-w-0">
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-medium">
            <span className="font-semibold text-slate-600 dark:text-slate-300">{hospital.Hospital_Category}</span>
            <span>•</span>
            <span>{hospital.Hospital_Care_Type}</span>
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            {hospital.Hospital_Name}
          </h3>

          <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>{hospital.City}</span>
            <span>•</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {hospital.distance_km !== undefined ? `${hospital.distance_km} km` : 'Proximity matched'}
            </span>
            <span>•</span>
            <span className="text-slate-500">~{hospital.Estimated_Wait_Min || 10}m travel</span>
          </div>
        </div>

        {/* Compact Suitability Rating */}
        <div className="flex flex-col items-end shrink-0" title={`Suitability score: ${score}/100`}>
          <div className="flex items-baseline space-x-0.5 font-mono">
            <span className="text-base sm:text-lg font-extrabold text-teal-700 dark:text-teal-400 leading-none">
              {score}
            </span>
            <span className="text-[10px] text-slate-400">/100</span>
          </div>
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
            Suitability
          </span>
        </div>
      </div>

      {/* 2. Structured Operational Metrics Strip (Compact, clear labels) */}
      <div className="grid grid-cols-4 gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">ICU Beds</span>
          <span className={`font-bold ${icuStatusColor}`}>
            {icuAvailable} avail
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block font-medium">Total Beds</span>
          <span className={`font-bold ${bedsStatusColor}`}>
            {bedsAvailable} avail
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block font-medium">ER Intake</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            ~{hospital.Estimated_Wait_Min || 8}m wait
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block font-medium">Rating</span>
          <div className="flex items-center space-x-1 font-bold text-slate-800 dark:text-slate-200">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{hospital.Hospital_Rating}</span>
          </div>
        </div>
      </div>

      {/* 3. Facility Badges (Subtle, not bloated pills) */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-[11px] text-slate-600 dark:text-slate-400">
        {hospital.Emergency_Services === 'Yes' && (
          <span className="text-rose-700 dark:text-rose-400 font-semibold">
            24×7 ER
          </span>
        )}
        {hospital.Trauma_Center === 'Yes' && (
          <>
            <span>•</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">Trauma Center</span>
          </>
        )}
        {hospital.Ambulance_Available === 'Yes' && (
          <>
            <span>•</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">Ambulance</span>
          </>
        )}
        {hospital.Cardiology === 'Yes' && (
          <>
            <span>•</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">Cardiology</span>
          </>
        )}
        {hospital.Neurology === 'Yes' && (
          <>
            <span>•</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">Neurology</span>
          </>
        )}
      </div>

      {/* 4. Expandable "Why this hospital?" Accordion */}
      <div className="mt-2" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center justify-between w-full text-[11px] font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 py-0.5 cursor-pointer"
        >
          <span className="flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Why this hospital?
          </span>
          {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showExplanation && (
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 space-y-1.5 mt-1">
            {hospital.why_recommended && (
              <p className="font-medium text-slate-800 dark:text-slate-200">{hospital.why_recommended}</p>
            )}
            
            <div className="grid grid-cols-2 gap-1 pt-1 text-[11px]">
              <div>
                <span className="text-slate-400">Distance: </span>
                <strong className="text-slate-900 dark:text-white">{hospital.distance_km !== undefined ? `${hospital.distance_km} km` : 'Near you'}</strong>
              </div>
              <div>
                <span className="text-slate-400">Emergency: </span>
                <strong className="text-slate-900 dark:text-white">{hospital.Emergency_Services === 'Yes' ? '24×7 Active' : 'Standard'}</strong>
              </div>
              <div>
                <span className="text-slate-400">ICU Readiness: </span>
                <strong className="text-slate-900 dark:text-white">{hospital.ICU_Available_Beds} beds available</strong>
              </div>
              <div>
                <span className="text-slate-400">Trauma Bay: </span>
                <strong className="text-slate-900 dark:text-white">{hospital.Trauma_Center === 'Yes' ? 'Level-1 Ready' : 'General'}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Primary and Secondary Action Buttons */}
      <div
        className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-1.5">
          {/* Dispatch Button */}
          <button
            type="button"
            disabled={isDispatched || hasActiveDispatch}
            onClick={() => {
              if (isDispatched || hasActiveDispatch) return;
              onSelectAndDispatch && onSelectAndDispatch(hospital);
            }}
            title={
              isDispatched
                ? 'Ambulance is actively dispatched'
                : hasActiveDispatch
                ? 'An ambulance dispatch is already active'
                : 'Initiate emergency dispatch to this facility'
            }
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
              isDispatched
                ? 'bg-emerald-600 text-white cursor-default'
                : hasActiveDispatch
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-60'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 border border-emerald-300/80 dark:border-emerald-800/80 active:scale-95'
            }`}
          >
            <Ambulance className="w-3.5 h-3.5" />
            <span>{isDispatched ? 'Dispatched' : 'Dispatch Here'}</span>
          </button>

          {/* Compare Checkbox */}
          <button
            type="button"
            onClick={() => onToggleCompare(hospital)}
            className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
              isCompared
                ? 'bg-teal-600 text-white border-teal-600'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {isCompared ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            <span className="hidden sm:inline">{isCompared ? 'Compared' : 'Compare'}</span>
          </button>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Show on Map */}
          <button
            type="button"
            onClick={() => onShowOnMap(hospital)}
            className="flex items-center space-x-1 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="Focus hospital on map"
          >
            <Map className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="hidden sm:inline">Map</span>
          </button>

          {/* View Details */}
          <button
            type="button"
            onClick={() => onSelect(hospital)}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white transition active:scale-95 cursor-pointer"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
