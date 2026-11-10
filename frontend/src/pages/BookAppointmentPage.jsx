import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CalendarPlus,
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { getDoctors, getPatients, createAppointment } from '../services/api';
import Toast from '../components/Toast';

export default function BookAppointmentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [selectedDoctorId, setSelectedDoctorId] = useState(searchParams.get('doctorId') || '');
  const [selectedPatientId, setSelectedPatientId] = useState(searchParams.get('patientId') || '');
  const [appointmentDate, setAppointmentDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('10:00');
  const [reason, setReason] = useState('Routine Medical Consultation');

  // Feedback states
  const [errorBanner, setErrorBanner] = useState(null);
  const [successAppt, setSuccessAppt] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchSelectOptions = async () => {
      setLoadingInitial(true);
      try {
        const [docs, pats] = await Promise.all([getDoctors(), getPatients()]);
        setDoctors(docs);
        setPatients(pats);

        if (!selectedDoctorId && docs.length > 0) {
          setSelectedDoctorId(String(docs[0].id));
        }
        if (!selectedPatientId && pats.length > 0) {
          setSelectedPatientId(String(pats[0].id));
        }
      } catch (err) {
        setToast({ type: 'error', message: err.message || 'Failed to load doctors and patients' });
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchSelectOptions();
  }, []);

  // Compute End Time dynamically based on selected doctor's duration
  const selectedDoctor = doctors.find((d) => String(d.id) === String(selectedDoctorId));
  const selectedPatient = patients.find((p) => String(p.id) === String(selectedPatientId));

  const calculateEndTime = (startStr, durationMins = 30) => {
    if (!startStr) return '--:--';
    const [hStr, mStr] = startStr.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (isNaN(h) || isNaN(m)) return '--:--';

    const totalMinutes = h * 60 + m + durationMins;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  };

  const calculatedEndTime = calculateEndTime(
    startTime,
    selectedDoctor?.consultationDuration || 30
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorBanner(null);
    setSuccessAppt(null);

    if (!selectedDoctorId || !selectedPatientId || !appointmentDate || !startTime) {
      setErrorBanner('Please ensure all required booking fields are selected.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        doctorId: parseInt(selectedDoctorId, 10),
        patientId: parseInt(selectedPatientId, 10),
        appointmentDate,
        startTime,
        reason: reason.trim() || 'General Consultation',
      };

      const result = await createAppointment(payload);
      setSuccessAppt(result);
      setToast({ type: 'success', message: 'Appointment booked successfully!' });
    } catch (err) {
      // Backend conflict or validation error
      setErrorBanner(err.message || 'An error occurred during booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#172B2B]">Book an Appointment</h2>
        <p className="text-sm text-[#697B7B] mt-1">
          Coordinate consultations with automatic conflict prevention and real-time validation.
        </p>
      </div>

      {/* Success Banner */}
      {successAppt && (
        <div className="p-6 rounded-2xl bg-[#EBF7F2] border border-[#C2E8D7] text-[#0E5B57] space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-[#126C68]" />
            <h3 className="text-base font-bold">Appointment Confirmed! (ID: #{successAppt.id})</h3>
          </div>
          <p className="text-sm leading-relaxed text-[#172B2B]">
            Successfully booked for <strong>{successAppt.patientName}</strong> with{' '}
            <strong>{successAppt.doctorName}</strong> on <strong>{successAppt.appointmentDate}</strong> from{' '}
            <span className="font-mono font-semibold">{successAppt.startTime} to {successAppt.endTime}</span>.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => navigate('/appointments')}
              className="px-4 py-2 bg-[#126C68] text-white text-xs font-semibold rounded-xl hover:bg-[#0D504D] transition-colors"
            >
              View in Appointments Table
            </button>
            <button
              onClick={() => {
                setSuccessAppt(null);
                setErrorBanner(null);
              }}
              className="px-4 py-2 bg-white text-[#126C68] border border-[#C2E8D7] text-xs font-semibold rounded-xl hover:bg-[#F2FAF6] transition-colors"
            >
              Book Another
            </button>
          </div>
        </div>
      )}

      {/* Error Banner for Business Rule Violations (409 Conflict) */}
      {errorBanner && (
        <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-800 space-y-2">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-red-900">Booking Rejected by Business Rule</h4>
              <p className="text-sm mt-1 text-red-700 leading-relaxed">{errorBanner}</p>
            </div>
          </div>
          <div className="text-xs text-red-600 bg-red-100/60 p-2.5 rounded-lg">
            <strong>Rule Reminder:</strong> A doctor cannot have overlapping active appointments, and a patient cannot book more than TWO active appointments per calendar date.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Form (2 cols) */}
        <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-slate-200/80 card-shadow">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Patient Selector */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-[#172B2B] mb-1.5">
                <User className="w-4 h-4 text-[#126C68]" />
                <span>Select Patient</span>
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-[#126C68] focus:ring-1 focus:ring-[#126C68] bg-white cursor-pointer"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Age: {p.age}, {p.email})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#697B7B] mt-1">
                Patients may book a maximum of 2 active appointments per day.
              </p>
            </div>

            {/* 2. Doctor Selector */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-[#172B2B] mb-1.5">
                <Stethoscope className="w-4 h-4 text-[#126C68]" />
                <span>Select Doctor</span>
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-[#126C68] focus:ring-1 focus:ring-[#126C68] bg-white cursor-pointer"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.specialization} ({d.consultationDuration} min)
                  </option>
                ))}
              </select>
              {selectedDoctor && (
                <div className="mt-1 text-[11px] text-[#126C68] font-medium">
                  Consultation Duration: {selectedDoctor.consultationDuration} minutes
                </div>
              )}
            </div>

            {/* 3. Date & Start Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-[#172B2B] mb-1.5">
                  <Calendar className="w-4 h-4 text-[#126C68]" />
                  <span>Appointment Date</span>
                </label>
                <input
                  type="date"
                  required
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-[#126C68] focus:ring-1 focus:ring-[#126C68] cursor-pointer"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-[#172B2B] mb-1.5">
                  <Clock className="w-4 h-4 text-[#126C68]" />
                  <span>Start Time</span>
                </label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-[#126C68] focus:ring-1 focus:ring-[#126C68] bg-white cursor-pointer"
                >
                  <option value="09:00">09:00 AM</option>
                  <option value="09:30">09:30 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="10:15">10:15 AM</option>
                  <option value="10:30">10:30 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="11:30">11:30 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="14:30">02:30 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="15:30">03:30 PM</option>
                  <option value="16:00">04:00 PM</option>
                </select>
              </div>
            </div>

            {/* 4. Reason */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-[#172B2B] mb-1.5">
                <FileText className="w-4 h-4 text-[#126C68]" />
                <span>Consultation Reason</span>
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Follow-up, Routine Checkup, Knee Soreness"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-[#126C68] focus:ring-1 focus:ring-[#126C68]"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={submitting || loadingInitial}
                className="w-full py-3 bg-[#126C68] hover:bg-[#0D504D] text-white font-semibold rounded-xl transition-all shadow-sm shadow-[#126C68]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>{submitting ? 'Confirming Slot with Backend...' : 'Confirm and Book Appointment'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Booking Summary Card (1 col) */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 card-shadow flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Info className="w-4 h-4 text-[#126C68]" />
              <h3 className="text-sm font-bold text-[#172B2B]">Live Booking Summary</h3>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Patient</span>
                <span className="font-semibold text-[#172B2B] text-sm">
                  {selectedPatient?.name || 'Select a patient'}
                </span>
                {selectedPatient && (
                  <span className="text-[11px] text-[#697B7B] block">{selectedPatient.email}</span>
                )}
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Doctor</span>
                <span className="font-semibold text-[#172B2B] text-sm">
                  {selectedDoctor?.name || 'Select a doctor'}
                </span>
                {selectedDoctor && (
                  <span className="text-[11px] text-[#126C68] font-medium block">
                    {selectedDoctor.specialization}
                  </span>
                )}
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Date</span>
                <span className="font-semibold text-[#172B2B]">{appointmentDate}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Calculated Time Slot</span>
                <div className="inline-flex items-center gap-1 font-mono font-bold text-xs text-[#126C68] bg-[#DDF2E9] px-2.5 py-1 rounded-md mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{startTime} – {calculatedEndTime}</span>
                </div>
                <span className="text-[10px] text-[#697B7B] block mt-1">
                  Auto-calculated from doctor's {selectedDoctor?.consultationDuration || 30}-min duration.
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Consultation Purpose</span>
                <span className="font-medium text-[#172B2B] italic">
                  "{reason || 'General Consultation'}"
                </span>
              </div>
            </div>
          </div>

          {/* Conflict Protection Notice */}
          <div className="p-3.5 rounded-xl bg-[#F7F9F8] border border-slate-200 text-[11px] text-[#697B7B] space-y-1">
            <span className="font-bold text-[#126C68] block">Automatic Business Rules:</span>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Doctor overlap rejected (409 Conflict).</li>
              <li>Patient limited to 2 active bookings/day.</li>
              <li>Protected against simultaneous bookings.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
