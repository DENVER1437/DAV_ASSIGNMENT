import React, { useEffect } from 'react';
import {
  X,
  MapPin,
  Bed,
  HeartPulse,
  Clock,
  Star,
  Activity,
  ShieldCheck,
  Ambulance,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hospital } from '../types';

interface HospitalDrawerProps {
  hospital: Hospital | null;
  onClose: () => void;
  onShowOnMap: (hospital: Hospital) => void;
  onSelectAndDispatch?: (hospital: Hospital) => void;
  isSelected?: boolean;
}

export const HospitalDrawer: React.FC<HospitalDrawerProps> = ({
  hospital,
  onClose,
  onShowOnMap,
  onSelectAndDispatch,
  isSelected,
}) => {
  // ESC key listener to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && hospital) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hospital, onClose]);

  if (!hospital) return null;

  const score = hospital.suitability_score || 80;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
              <span className="font-semibold text-teal-700 dark:text-teal-400">{hospital.Hospital_Category}</span>
              <span>•</span>
              <span>{hospital.Hospital_Care_Type}</span>
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight truncate">
              {hospital.Hospital_Name}
            </h2>

            <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>{hospital.City}, {hospital.State}</span>
              <span>•</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {hospital.distance_km ? `${hospital.distance_km} km away` : 'Near you'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          
          {/* Suitability Score Summary */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1 text-teal-600" />
                  Suitability Score
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Multi-criteria match based on intake priorities
                </p>
              </div>

              <div className="text-right font-mono">
                <span className="text-2xl font-black text-teal-700 dark:text-teal-400 leading-none">
                  {score}
                </span>
                <span className="text-xs text-slate-400">/100</span>
              </div>
            </div>

            {/* Score Breakdown Ratings */}
            {hospital.score_breakdown && (
              <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Distance Proximity</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {hospital.score_breakdown.distance_rating}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Bed Availability</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {hospital.score_breakdown.bed_rating}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">ICU Capacity</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {hospital.score_breakdown.icu_rating}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Intake Speed</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {hospital.score_breakdown.wait_rating}
                  </span>
                </div>
              </div>
            )}

            {hospital.why_recommended && (
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-2.5 italic">
                "{hospital.why_recommended}"
              </p>
            )}
          </div>

          {/* Section: Capacity Telemetry */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center">
              <Bed className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
              Inpatient &amp; Critical Care Capacity
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              {/* General Beds */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-xs text-slate-500 font-medium">Inpatient Beds</span>
                <div className="flex items-baseline space-x-1 mt-0.5">
                  <span className="text-xl font-bold text-slate-900 dark:text-white">{hospital.Available_Beds}</span>
                  <span className="text-xs text-slate-400">avail / {hospital.Total_Beds}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-teal-600 h-full rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(5, hospital.Bed_Occupancy_Pct || 70))}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {hospital.Bed_Occupancy_Pct || 0}% Occupancy
                </span>
              </div>

              {/* ICU Beds */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-xs text-slate-500 font-medium">ICU Beds</span>
                <div className="flex items-baseline space-x-1 mt-0.5">
                  <span className="text-xl font-bold text-rose-600 dark:text-rose-400">{hospital.ICU_Available_Beds}</span>
                  <span className="text-xs text-slate-400">avail / {hospital.ICU_Total_Beds}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(5, hospital.ICU_Occupancy_Pct || 80))}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {hospital.ICU_Occupancy_Pct || 0}% Saturation
                </span>
              </div>
            </div>
          </div>

          {/* Section: Emergency & Urgent Care Readiness */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center">
              <Activity className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
              Emergency Services &amp; Facilities
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 font-medium">24x7 ER</span>
                {hospital.Emergency_Services === 'Yes' ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Trauma</span>
                {hospital.Trauma_Center === 'Yes' ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Ambulance</span>
                {hospital.Ambulance_Available === 'Yes' ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 font-medium">24x7 Support</span>
                {hospital['24x7_Service'] === 'Yes' ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </div>
          </div>

          {/* Section: Medical Specialties */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center">
              <HeartPulse className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
              Specialized Departments
            </h3>

            <div className="flex flex-wrap gap-1.5 text-xs">
              {[
                { name: 'Cardiology', active: hospital.Cardiology === 'Yes' },
                { name: 'Neurology', active: hospital.Neurology === 'Yes' },
                { name: 'Orthopedics', active: hospital.Orthopedics === 'Yes' },
                { name: 'Pediatrics', active: hospital.Pediatrics === 'Yes' },
                { name: 'Gynecology', active: hospital.Gynecology === 'Yes' },
              ].map((spec) => (
                <div
                  key={spec.name}
                  className={`px-2.5 py-1 rounded-md border flex items-center space-x-1.5 ${
                    spec.active
                      ? 'border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-400 opacity-60'
                  }`}
                >
                  {spec.active ? <CheckCircle className="w-3 h-3 text-teal-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                  <span>{spec.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Operational Wait Times */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
              Wait Times &amp; Response
            </h3>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 text-[10px] block">Intake Wait</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  ~{hospital.Estimated_Wait_Min}m
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 text-[10px] block">Response</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {hospital.Average_Response_Time_Min}m
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 text-[10px] block">Rating</span>
                <div className="flex items-center space-x-1 font-bold text-slate-900 dark:text-white">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{hospital.Hospital_Rating}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => onShowOnMap(hospital)}
            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm transition cursor-pointer"
          >
            Show on Map
          </button>

          <button
            type="button"
            onClick={() => {
              if (onSelectAndDispatch) onSelectAndDispatch(hospital);
              onClose();
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer ${
              isSelected
                ? 'bg-emerald-600 text-white'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            <Ambulance className="w-4 h-4" />
            <span>{isSelected ? '✓ Hospital Selected' : 'Select & Dispatch'}</span>
          </button>
        </div>

      </motion.div>
    </div>
  );
};
