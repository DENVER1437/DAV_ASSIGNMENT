import React, { useState, useEffect } from 'react';
import {
  Ambulance,
  X,
  User,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Hospital } from '../types';

export interface PatientDispatchInfo {
  patientName: string;
  contactPhone: string;
  severity: string;
  pickupAddress: string;
  symptoms: string[];
}

interface DispatchModalProps {
  hospital: Hospital;
  detectedLocality?: string | null;
  onConfirm: (info: PatientDispatchInfo) => void;
  onClose: () => void;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  hospital,
  detectedLocality,
  onConfirm,
  onClose,
}) => {
  const [patientName, setPatientName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState(detectedLocality || 'Gota, Ahmedabad');
  const [severity, setSeverity] = useState('Critical (Immediate ALS)');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Chest Pain', 'Difficulty Breathing']);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; address?: string }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const validate = (): boolean => {
    const errs: { name?: string; phone?: string; address?: string } = {};

    if (!patientName.trim() || patientName.trim().length < 2) {
      errs.name = 'Please enter a valid patient or caller name (min 2 characters).';
    }

    const cleanPhone = contactPhone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errs.phone = 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
    }

    if (!pickupAddress.trim()) {
      errs.address = 'Please specify pickup address or locality.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onConfirm({
        patientName: patientName.trim(),
        contactPhone: contactPhone.replace(/\D/g, ''),
        severity,
        pickupAddress: pickupAddress.trim(),
        symptoms: selectedSymptoms,
      });
    }
  };

  const estWait = hospital.Estimated_Wait_Min || 8;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 dark:bg-slate-800 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Ambulance className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold tracking-tight">
                Confirm Emergency Dispatch
              </h3>
              <p className="text-[11px] text-slate-400">
                Direct ALS Unit Dispatch • Zero-Wait ER Pre-Admission
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Hospital Destination Card */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              Confirm Destination
            </span>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
              {hospital.Hospital_Name}
            </h4>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
              {hospital.City} • {hospital.distance_km !== undefined ? `${hospital.distance_km} km away` : 'Near you'}
            </span>
          </div>

          <div className="text-right">
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
              {hospital.ICU_Available_Beds} ICU Ready
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-end space-x-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>Est. Transit: ~{estWait}m</span>
            </p>
          </div>
        </div>

        {/* Dispatch Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs overflow-y-auto flex-1">
          
          {/* Patient / Caller Name */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>Patient / Caller Full Name *</span>
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. Ramesh Patel"
              className={`w-full py-2 px-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-rose-500 focus:ring-rose-500'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-teal-500'
              }`}
            />
            {errors.name && <p className="text-[11px] text-rose-500 font-semibold">{errors.name}</p>}
          </div>

          {/* Contact Mobile */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-1">
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span>Emergency Mobile (10 digits) *</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-semibold text-xs">+91</span>
              <input
                type="tel"
                maxLength={10}
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="9876543210"
                className={`w-full py-2 pl-12 pr-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 font-mono ${
                  errors.phone
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-teal-500'
                }`}
              />
            </div>
            {errors.phone && <p className="text-[11px] text-rose-500 font-semibold">{errors.phone}</p>}
          </div>

          {/* Pickup Address */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>Pickup Location *</span>
            </label>
            <input
              type="text"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="Building, street, neighborhood, landmark"
              className={`w-full py-2 px-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                errors.address
                  ? 'border-rose-500 focus:ring-rose-500'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-teal-500'
              }`}
            />
            {errors.address && <p className="text-[11px] text-rose-500 font-semibold">{errors.address}</p>}
          </div>

          {/* Observed Symptoms */}
          <div className="space-y-1.5 pt-0.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px]">
              Clinical Symptoms (Paramedic Crew Brief):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Chest Pain',
                'Difficulty Breathing',
                'Loss of Consciousness',
                'Severe Bleeding / Trauma',
                'Stroke Symptoms (FAST)',
              ].map((sym) => {
                const isSelected = selectedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-800 dark:text-teal-300'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {isSelected ? `✓ ${sym}` : `+ ${sym}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guarantee */}
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Priority reservation: ER bay notified and nearest ALS unit assigned immediately.</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Ambulance className="w-4 h-4" />
              <span>Confirm Dispatch</span>
            </button>
          </div>

        </form>

      </motion.div>
    </div>
  );
};
