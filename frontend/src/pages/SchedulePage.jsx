import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  Stethoscope,
  User,
  Plus,
  RefreshCw,
  CalendarCheck2,
  CalendarX2,
  AlertCircle
} from 'lucide-react';
import { getAppointments, getDoctors } from '../services/api';
import InitialsAvatar from '../components/InitialsAvatar';

export default function SchedulePage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedDoctorId, setSelectedDoctorId] = useState('ALL');
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorsList = async () => {
      try {
        const docs = await getDoctors();
        setDoctors(docs);
      } catch (e) {
        console.error(e);
      }
    };
    fetchDoctorsList();
  }, []);

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const params = { date: selectedDate };
      if (selectedDoctorId !== 'ALL') {
        params.doctorId = selectedDoctorId;
      }
      const data = await getAppointments(params);
      // Sort by start time ascending
      data.sort((a, b) => (a.startTime > b.startTime ? 1 : -1));
      setAppointments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [selectedDate, selectedDoctorId]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#172B2B]">Daily Schedule View</h2>
          <p className="text-sm text-[#697B7B] mt-1">
            Chronological timeline of scheduled consultations filtered by date and clinician.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadSchedule}
            disabled={loading}
            className="p-2 text-[#697B7B] hover:text-[#172B2B] bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh Schedule"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate(`/book?date=${selectedDate}${selectedDoctorId !== 'ALL' ? `&doctorId=${selectedDoctorId}` : ''}`)}
            className="flex items-center gap-2 px-4 py-2 bg-[#126C68] hover:bg-[#0D504D] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Book for this Day</span>
          </button>
        </div>
      </div>

      {/* Controls Bar: Date Picker + Doctor Dropdown */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 card-shadow flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#172B2B]">Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-[#126C68] focus:ring-1 focus:ring-[#126C68] cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#172B2B]">Doctor:</span>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-[#126C68] focus:ring-1 focus:ring-[#126C68] bg-white cursor-pointer"
          >
            <option value="ALL">All Doctors</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.specialization})
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto text-xs text-[#697B7B]">
          Total Slots: <strong className="text-[#172B2B]">{appointments.length}</strong>
        </div>
      </div>

      {/* Timeline Schedule Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-24 bg-white border border-slate-200 rounded-2xl animate-pulse p-4" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
            <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[#172B2B]">No appointments scheduled</h3>
            <p className="text-xs text-[#697B7B] mt-1">
              There are no consultations scheduled for {selectedDate}.
            </p>
            <button
              onClick={() => navigate(`/book?date=${selectedDate}`)}
              className="mt-4 px-4 py-2 bg-[#126C68] text-white text-xs font-semibold rounded-lg hover:bg-[#0D504D]"
            >
              Book an Appointment
            </button>
          </div>
        ) : (
          appointments.map((appt) => (
            <div
              key={appt.id}
              className={`p-5 rounded-2xl border transition-all ${
                appt.status === 'BOOKED'
                  ? 'bg-white border-slate-200/80 card-shadow hover:border-[#126C68]/40'
                  : 'bg-slate-50 border-slate-200/60 opacity-75'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Time & Doctor */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-slate-100 text-[#172B2B] flex flex-col items-center justify-center font-mono shrink-0">
                    <Clock className="w-4 h-4 text-[#126C68] mb-1" />
                    <span className="text-xs font-bold">{appt.startTime}</span>
                    <span className="text-[10px] text-slate-400">{appt.endTime}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-[#172B2B]">{appt.doctorName}</h4>
                      <span className="text-xs font-semibold text-[#126C68] bg-[#DDF2E9] px-2 py-0.5 rounded-md">
                        {appt.doctorSpecialization}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-xs text-[#697B7B]">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Patient: <strong className="text-[#172B2B]">{appt.patientName}</strong></span>
                      <span className="text-slate-300">•</span>
                      <span>Purpose: <em className="text-[#172B2B]">{appt.reason || 'General Consultation'}</em></span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      appt.status === 'BOOKED'
                        ? 'bg-[#EBF7F2] text-[#0E5B57]'
                        : 'bg-[#FEF2F2] text-[#DC2626]'
                    }`}
                  >
                    {appt.status === 'BOOKED' ? (
                      <CalendarCheck2 className="w-3.5 h-3.5 text-[#126C68]" />
                    ) : (
                      <CalendarX2 className="w-3.5 h-3.5 text-[#DC2626]" />
                    )}
                    <span>{appt.status}</span>
                  </span>

                  {appt.status === 'CANCELLED' && (
                    <span className="text-xs text-slate-500 font-medium">Slot is available</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
