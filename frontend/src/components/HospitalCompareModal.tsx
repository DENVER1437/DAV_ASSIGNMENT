import React from 'react';
import { X, Check, ShieldCheck, Bed, HeartPulse, Clock, Star, MapPin, Ambulance } from 'lucide-react';
import { Hospital } from '../types';

interface HospitalCompareModalProps {
  hospitals: Hospital[];
  onClose: () => void;
  onRemoveHospital: (hospitalId: string) => void;
  onSelectHospital: (hospital: Hospital) => void;
}

export const HospitalCompareModal: React.FC<HospitalCompareModalProps> = ({
  hospitals,
  onClose,
  onRemoveHospital,
  onSelectHospital,
}) => {
  if (hospitals.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Side-by-Side Evaluation
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Compare Emergency Facilities ({hospitals.length}/3)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table Grid */}
        <div className="flex-1 overflow-x-auto p-5 sm:p-6">
          <table className="w-full border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="p-3 font-semibold text-slate-400 w-1/4">Metric</th>
                {hospitals.map((h) => (
                  <th key={h.Hospital_ID} className="p-3 w-1/4 align-top">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative">
                      <button
                        type="button"
                        onClick={() => onRemoveHospital(h.Hospital_ID)}
                        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-500 rounded-full"
                        title="Remove from comparison"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase">
                        {h.Hospital_Category}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mt-0.5 truncate">
                        {h.Hospital_Name}
                      </h4>
                      <p className="text-[11px] text-slate-400">{h.City}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              
              {/* Suitability Score */}
              <tr className="bg-teal-50/40 dark:bg-teal-950/20">
                <td className="p-3 font-bold text-teal-800 dark:text-teal-300">
                  Suitability Score
                </td>
                {hospitals.map((h) => (
                  <td key={h.Hospital_ID} className="p-3">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-teal-600 text-white font-extrabold text-sm">
                      {h.suitability_score || 75}/100
                    </span>
                  </td>
                ))}
              </tr>

              {/* Distance */}
              <tr>
                <td className="p-3 text-slate-500 font-medium">Distance</td>
                {hospitals.map((h) => (
                  <td key={h.Hospital_ID} className="p-3 font-bold text-slate-900 dark:text-white">
                    {h.distance_km ? `${h.distance_km} km` : 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Available Beds */}
              <tr>
                <td className="p-3 text-slate-500 font-medium">Available / Total Beds</td>
                {hospitals.map((h) => (
                  <td key={h.Hospital_ID} className="p-3">
                    <span className="font-bold text-slate-900 dark:text-white">{h.Available_Beds}</span>
                    <span className="text-slate-400 text-xs"> / {h.Total_Beds}</span>
                  </td>
                ))}
              </tr>

              {/* ICU Availability */}
              <tr>
                <td className="p-3 text-slate-500 font-medium">ICU Beds Available</td>
                {hospitals.map((h) => (
                  <td key={h.Hospital_ID} className="p-3">
                    <span className="font-bold text-rose-600 dark:text-rose-400">{h.ICU_Available_Beds}</span>
                    <span className="text-slate-400 text-xs"> / {h.ICU_Total_Beds}</span>
                  </td>
                ))}
              </tr>

              {/* Estimated ER Wait */}
              <tr>
                <td className="p-3 text-slate-500 font-medium">Est. ER Intake Wait</td>
                {hospitals.map((h) => (
                  <td key={h.Hospital_ID} className="p-3 font-bold text-slate-900 dark:text-white">
                    ~{h.Estimated_Wait_Min} mins
                  </td>
                ))}
              </tr>

              {/* Emergency Services */}
              <tr>
                <td className="p-3 text-slate-500 font-medium">24x7 Emergency Room</td>
                {hospitals.map((h) => (
                  <td key={h.Hospital_ID} className="p-3 font-semibold">
                    {h.Emergency_Services === 'Yes' ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Yes</span>
                    ) : (
                      <span className="text-slate-400">No</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Trauma Center */}
              <tr>
                <td className="p-3 text-slate-500 font-medium">Trauma Center</td>
                {hospitals.map((h) => (
                  <td key={h.Hospital_ID} className="p-3 font-semibold">
                    {h.Trauma_Center === 'Yes' ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Level-1 Ready</span>
                    ) : (
                      <span className="text-slate-400">No</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Ambulance Available */}
              <tr>
                <td className="p-3 text-slate-500 font-medium">Ambulance Fleet</td>
                {hospitals.map((h) => (
                  <td key={h.Hospital_ID} className="p-3 font-semibold">
                    {h.Ambulance_Available === 'Yes' ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active</span>
                    ) : (
                      <span className="text-slate-400">Unavailable</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Rating */}
              <tr>
                <td className="p-3 text-slate-500 font-medium">Rating</td>
                {hospitals.map((h) => (
                  <td key={h.Hospital_ID} className="p-3 font-bold text-slate-900 dark:text-white">
                    ⭐ {h.Hospital_Rating} / 5.0
                  </td>
                ))}
              </tr>

              {/* Action row */}
              <tr>
                <td className="p-3 text-slate-400">Action</td>
                {hospitals.map((h) => (
                  <td key={h.Hospital_ID} className="p-3">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectHospital(h);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs"
                    >
                      View Details
                    </button>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
