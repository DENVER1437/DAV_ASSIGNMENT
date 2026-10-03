import React, { useState } from 'react';
import {
  Ambulance,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  MapPin,
  HeartPulse,
  Bed,
  X,
  ExternalLink,
  Radio,
  FileCheck,
  Zap,
  Activity,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  Lock,
} from 'lucide-react';
import { Hospital, DispatchPhase, SimulationSpeed } from '../types';
import { PatientDispatchInfo } from './DispatchModal';

interface ActiveDispatchHubProps {
  hospital: Hospital;
  emergencyType?: string;
  patientInfo?: PatientDispatchInfo | null;
  dispatchPhase: DispatchPhase;
  secondsRemaining: number;
  simulationSpeed: SimulationSpeed;
  onChangeSpeed: (speed: SimulationSpeed) => void;
  onAdvanceToTransit: () => void;
  onCompleteAdmission: () => void;
  onCancelDispatch: () => void;
  onFocusOnMap: () => void;
  onOpenDetails: () => void;
  onChangeHospital?: () => void;
}

export const ActiveDispatchHub: React.FC<ActiveDispatchHubProps> = ({
  hospital,
  emergencyType = 'Emergency',
  patientInfo,
  dispatchPhase,
  secondsRemaining,
  simulationSpeed,
  onChangeSpeed,
  onAdvanceToTransit,
  onCompleteAdmission,
  onCancelDispatch,
  onFocusOnMap,
  onOpenDetails,
  onChangeHospital,
}) => {
  const [showBedDetails, setShowBedDetails] = useState<boolean>(true);

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // Deterministic allocated ICU bed number & details based on hospital ID
  const hospitalNum = parseInt(hospital.Hospital_ID.replace(/\D/g, '') || '5', 10);
  const icuBedIndex = (hospitalNum % 6) + 1;
  const icuBedNumber = `#ICU-0${icuBedIndex}`;
  const ventilatorId = `#VENT-${100 + (hospitalNum % 40)}`;
  const triageToken = `#PR-${hospital.Hospital_ID.slice(-4)}-PRIORITY`;
  const zeroWaitPass = `ZW-${hospital.Hospital_ID.slice(-4)}-PRIORITY`;

  // Doctors on duty
  const doctorsList = [
    { name: 'Dr. Rajiv Deshmukh', role: 'Head of Emergency & Trauma MD', exp: '16 yrs exp' },
    { name: 'Dr. Sneha Pillai', role: 'Senior Critical Care Intensivist', exp: '12 yrs exp' },
    { name: 'Dr. Vikramaditya Mehta', role: 'Emergency Resuscitation Lead', exp: '14 yrs exp' },
    { name: 'Dr. Ananya Sharma', role: 'Trauma & Acute Surgery Consultant', exp: '11 yrs exp' },
  ];
  const assignedDoctor = doctorsList[hospitalNum % doctorsList.length];

  // Map phase to timeline stage index: 0=Dispatched, 1=En Route, 2=On-Scene, 3=Bay Intake
  let currentStageIndex = 1;
  if (dispatchPhase === 'arrived_patient') currentStageIndex = 2;
  if (dispatchPhase === 'transit_hospital') currentStageIndex = 2;
  if (dispatchPhase === 'admitted_complete') currentStageIndex = 3;

  return (
    <div id="active-dispatch-hub" className="rounded-2xl border-2 border-emerald-500 bg-white dark:bg-slate-800/95 shadow-xl overflow-hidden animate-in fade-in duration-200">
      {/* Top Active Dispatch Banner */}
      <div className="bg-emerald-600 dark:bg-emerald-700 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
          <span className="text-xs font-extrabold uppercase tracking-wider">
            Active Emergency Dispatch & Pre-Allocation Hub
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 text-white flex items-center space-x-1 border border-emerald-400/40">
            <span>🚑 Unit #PR-408</span>
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-800/60 text-white">
            {triageToken}
          </span>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Real-Time Speed Selector (1x, 2x, 5x, 10x) */}
          <div className="flex items-center space-x-1 bg-black/25 dark:bg-black/35 backdrop-blur-xs px-2 py-1 rounded-xl border border-white/20">
            <span className="text-[11px] font-bold text-emerald-100 flex items-center space-x-1 mr-1">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Speed:</span>
            </span>
            {([1, 2, 5, 10] as SimulationSpeed[]).map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => onChangeSpeed(spd)}
                title={`Set simulation speed to ${spd}x`}
                className={`px-2 py-0.5 rounded-lg text-xs font-black transition ${
                  simulationSpeed === spd
                    ? 'bg-amber-400 text-slate-950 shadow-sm ring-1 ring-amber-300 scale-105'
                    : 'text-white/80 hover:bg-white/20 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {onChangeHospital && (
            <button
              type="button"
              onClick={onChangeHospital}
              className="text-xs font-semibold hover:bg-emerald-800/60 px-2.5 py-1 rounded-lg transition bg-white/10 text-white"
            >
              ⇄ Change Hospital
            </button>
          )}

          <button
            type="button"
            onClick={onCancelDispatch}
            className="text-xs font-semibold hover:bg-emerald-800/60 px-2.5 py-1 rounded-lg transition flex items-center space-x-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Verified Patient Dispatch Banner */}
        {patientInfo && (
          <div className="p-3 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-bold text-teal-900 dark:text-teal-200">
                👤 Patient / Caller: <strong>{patientInfo.patientName}</strong>
              </span>
              <span>•</span>
              <span className="text-slate-700 dark:text-slate-300">
                📞 Mobile: <strong>+91 {patientInfo.contactPhone}</strong>
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                Verified Call
              </span>
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-[11px] truncate max-w-sm">
              📍 Pickup: <strong>{patientInfo.pickupAddress}</strong>
            </div>
          </div>
        )}

        {/* ================= PHASE NOTIFICATION BANNER ================= */}
        {dispatchPhase === 'arrived_patient' && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-400 dark:border-amber-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg animate-bounce shrink-0">
                🚨
              </div>
              <div>
                <h4 className="font-extrabold text-amber-950 dark:text-amber-100 text-sm">
                  Ambulance Unit #PR-408 has Arrived at Patient Location!
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  Paramedics on-scene with <strong>{patientInfo?.patientName || 'patient'}</strong> • Vitals assessed (BP: 126/82, HR: 84 bpm, SpO2: 97%) • Preparing for hospital transfer
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onAdvanceToTransit}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition shrink-0 flex items-center space-x-1"
            >
              <span>⚡ Patient Boarded • Start ER Transit →</span>
            </button>
          </div>
        )}

        {dispatchPhase === 'transit_hospital' && (
          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border-2 border-blue-400 dark:border-blue-600 flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg animate-pulse shrink-0">
                🚑
              </div>
              <div>
                <h4 className="font-extrabold text-blue-950 dark:text-blue-100 text-sm">
                  Priority Transit: En Route to {hospital.Hospital_Name} ER Bay
                </h4>
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Emergency green corridor active • ER Bay pre-alerted • Allocated Bed <strong>{icuBedNumber}</strong> warmed & sterilized
                </p>
              </div>
            </div>
          </div>
        )}

        {dispatchPhase === 'admitted_complete' && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
                🎉
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-emerald-950 dark:text-emerald-100 text-base">
                  Emergency Handover & Zero-Wait ER Admission Complete!
                </h4>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  Patient <strong>{patientInfo?.patientName || 'Patient'}</strong> successfully transferred to <strong>{hospital.Hospital_Name}</strong> ER Bay. Pre-allocated <strong>{icuBedNumber}</strong> confirmed active under <strong>{assignedDoctor.name}</strong>.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-emerald-900 dark:text-emerald-200">
                  <span className="px-2 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/60 font-semibold">Triage Code: Red-ALS</span>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/60 font-semibold">Allocated: {icuBedNumber} (Floor 2, Pod-A)</span>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/60 font-semibold">ER Handover: Signed & Complete</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onCompleteAdmission}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg transition shrink-0"
            >
              ✓ Complete Incident & Close
            </button>
          </div>
        )}

        {/* Main Grid: Destination Hospital & Live ETA Countdown */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Left: Selected Destination Hospital */}
          <div className="md:col-span-7 space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Target Facility
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                {hospital.Hospital_Category}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {hospital.Hospital_Name}
            </h3>

            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{hospital.City}</span>
              <span>•</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {hospital.distance_km !== undefined ? `${hospital.distance_km} km transit perimeter` : 'In city radius'}
              </span>
            </div>
          </div>

          {/* Right: Live ETA Countdown Clock */}
          <div className="md:col-span-5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl p-3.5 border border-emerald-200 dark:border-emerald-800/60 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center justify-center space-x-1">
              <Ambulance className="w-4 h-4 animate-bounce text-emerald-600 dark:text-emerald-400" />
              <span>
                {dispatchPhase === 'en_route_patient'
                  ? 'Ambulance Arrival ETA'
                  : dispatchPhase === 'arrived_patient'
                  ? 'Ambulance On-Scene'
                  : dispatchPhase === 'transit_hospital'
                  ? 'Transit to Hospital ER ETA'
                  : 'Emergency Admission Complete'}
              </span>
            </span>

            <div className="text-3xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-300 mt-0.5 font-mono">
              {dispatchPhase === 'arrived_patient'
                ? 'ON SCENE'
                : dispatchPhase === 'admitted_complete'
                ? 'ADMITTED'
                : timeFormatted}
            </div>

            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Unit #PR-408 (ALS Critical Care) • Live road navigation ({simulationSpeed}x)
            </span>
          </div>
        </div>

        {/* 4-Stage Dispatch Progress Timeline */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { id: 0, title: 'Unit Dispatched', desc: 'Bay-04 ALS Crew' },
              { id: 1, title: 'En Route to Patient', desc: 'Siren Active (Priority)' },
              { id: 2, title: 'On-Scene Arrival', desc: 'Triage Assessment' },
              { id: 3, title: 'Hospital Bay Intake', desc: `Bed ${icuBedNumber}` },
            ].map((stg) => {
              const isPast = currentStageIndex > stg.id;
              const isCurrent = currentStageIndex === stg.id;
              return (
                <div
                  key={stg.id}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    isPast
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300'
                      : isCurrent
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1 mb-0.5 font-bold text-[11px]">
                    {isPast ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : isCurrent ? (
                      <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                    )}
                    <span>{stg.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{stg.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= REAL-TIME CLINICAL ALLOCATION & ICU BED COMMAND UNIT ================= */}
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-linear-to-r from-emerald-50/60 via-teal-50/40 to-slate-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900/40 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-emerald-600 text-white">
                <Bed className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                    Pre-Allocated Critical Bed & Clinical Command
                  </h4>
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold text-[10px]">
                    <Lock className="w-2.5 h-2.5" />
                    <span>LOCKED FOR PATIENT</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Direct Zero-Wait Admission Protocol • Emergency Pass: <strong>#{zeroWaitPass}</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowBedDetails((prev) => !prev)}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40 transition"
            >
              <span>{showBedDetails ? 'Collapse Specs' : 'View Full Clinical Specs'}</span>
              {showBedDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Quick Summary Strip (Always Visible) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center space-x-2.5">
              <HeartPulse className="w-4 h-4 text-rose-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Allocated Bed ID</span>
                <strong className="text-slate-900 dark:text-white font-bold text-sm text-emerald-700 dark:text-emerald-300">
                  {icuBedNumber} (Ventilator Bay)
                </strong>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center space-x-2.5">
              <Stethoscope className="w-4 h-4 text-teal-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Attending Lead Physician</span>
                <strong className="text-slate-900 dark:text-white font-bold block truncate max-w-[180px]">
                  {assignedDoctor.name}
                </strong>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center space-x-2.5">
              <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Live Telemetry Link</span>
                <strong className="text-emerald-700 dark:text-emerald-300 font-bold flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>SpO2: 97% • HR: 84 bpm</span>
                </strong>
              </div>
            </div>
          </div>

          {/* Expanded Clinical & Equipment Specifications */}
          {showBedDetails && (
            <div className="pt-2 border-t border-emerald-100 dark:border-emerald-800/50 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs animate-in fade-in duration-150">
              
              {/* Left Column: Bed & Facility Details */}
              <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Bed Allocation & Department</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                    Sterilized & Prepped
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Unit Wing:</span>
                    <strong className="text-slate-800 dark:text-slate-200">Critical Care Tower (Floor 2)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Sub-Unit:</span>
                    <strong className="text-slate-800 dark:text-slate-200">Isolation Pod-A, Bay {icuBedNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Hospital Capacity:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{hospital.Available_Beds} Total Beds ({hospital.ICU_Available_Beds} ICU)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Triage Level:</span>
                    <strong className="text-rose-600 dark:text-rose-400 font-extrabold">Level 1 (Red / Immediate)</strong>
                  </div>
                </div>
              </div>

              {/* Right Column: Prepped Equipment & Clinical Standby Roster */}
              <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Staged Clinical Equipment & Team</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-bold">
                    Standby at ER Ramp
                  </span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span>• Mechanical Ventilator:</span>
                    <strong className="text-emerald-700 dark:text-emerald-300 font-mono">{ventilatorId} (Calibrated)</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span>• Attending Specialist:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{assignedDoctor.name} ({assignedDoctor.exp})</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span>• Life Support & Blood:</span>
                    <strong className="text-slate-800 dark:text-slate-200">2u O-Neg blood + Defibrillator</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span>• Fast-Track Check-In:</span>
                    <strong className="text-emerald-700 dark:text-emerald-300 font-mono">#{zeroWaitPass}</strong>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Action Controls Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onFocusOnMap}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition flex items-center space-x-1.5"
            >
              <Navigation className="w-3.5 h-3.5 text-teal-600" />
              <span>Track on Map</span>
            </button>

            <button
              type="button"
              onClick={onOpenDetails}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition flex items-center space-x-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
              <span>Hospital Protocol Details</span>
            </button>
          </div>

          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Priority road transit corridor and ER trauma bay pre-cleared</span>
          </span>
        </div>
      </div>
    </div>
  );
};
