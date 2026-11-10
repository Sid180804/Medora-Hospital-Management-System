import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck2,
  CalendarX2,
  Search,
  Filter,
  Clock,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Plus,
  CheckCircle2
} from 'lucide-react';
import { getAppointments, cancelAppointment } from '../services/api';
import InitialsAvatar from '../components/InitialsAvatar';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, BOOKED, CANCELLED
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancellingAppt, setCancellingAppt] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      const data = await getAppointments(params);
      setAppointments(data);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to load appointments' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [statusFilter]);

  const handleConfirmCancel = async () => {
    if (!cancellingAppt) return;
    setActionLoading(true);
    try {
      await cancelAppointment(cancellingAppt.id);
      setToast({
        type: 'success',
        message: `Appointment #${cancellingAppt.id} cancelled. The time slot is now released for other patients!`,
      });
      setCancellingAppt(null);
      loadAppointments();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to cancel appointment' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((appt) => {
    const q = searchQuery.toLowerCase();
    const docName = (appt.doctorName || '').toLowerCase();
    const patName = (appt.patientName || '').toLowerCase();
    const reason = (appt.reason || '').toLowerCase();
    const spec = (appt.doctorSpecialization || '').toLowerCase();
    return docName.includes(q) || patName.includes(q) || reason.includes(q) || spec.includes(q);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#172B2B]">Appointments Management</h2>
          <p className="text-sm text-[#697B7B] mt-1">
            Monitor, filter, and manage booked consultations. Cancelled slots are automatically freed.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadAppointments}
            disabled={loading}
            className="p-2 text-[#697B7B] hover:text-[#172B2B] bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh Appointments"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/book')}
            className="flex items-center gap-2 px-4 py-2 bg-[#126C68] hover:bg-[#0D504D] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-xl w-fit">
          {['ALL', 'BOOKED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#126C68] text-white shadow-2xs'
                  : 'text-[#697B7B] hover:text-[#172B2B] hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? 'All Statuses' : st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctor, patient, reason..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200/90 rounded-xl text-sm placeholder:text-slate-400 focus:outline-hidden focus:border-[#126C68] focus:ring-1 focus:ring-[#126C68] transition-all"
          />
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 card-shadow overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-12 bg-slate-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-16">
            <CalendarCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[#172B2B]">No appointments found</h3>
            <p className="text-xs text-[#697B7B] mt-1">
              {searchQuery || statusFilter !== 'ALL'
                ? 'Try adjusting your search query or filter selection.'
                : 'No appointments currently recorded.'}
            </p>
            <button
              onClick={() => navigate('/book')}
              className="mt-4 px-4 py-2 bg-[#126C68] text-white text-xs font-semibold rounded-lg hover:bg-[#0D504D]"
            >
              Book an Appointment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-[#FBFDFD] text-[11px] font-semibold text-[#697B7B] uppercase tracking-wider">
                  <th className="py-3.5 px-6">Patient</th>
                  <th className="py-3.5 px-6">Doctor</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Time Slot</th>
                  <th className="py-3.5 px-6">Reason</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <InitialsAvatar name={appt.patientName} size="sm" />
                        <div>
                          <span className="font-semibold text-[#172B2B] block">{appt.patientName}</span>
                          <span className="text-[11px] text-slate-400 font-mono">Appt #{appt.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-[#172B2B]">{appt.doctorName}</div>
                      <div className="text-xs text-[#126C68]">{appt.doctorSpecialization}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-xs text-[#172B2B] font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{appt.appointmentDate}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#172B2B] bg-slate-100 px-2 py-0.5 rounded-md">
                        <Clock className="w-3 h-3 text-[#126C68]" />
                        <span>{appt.startTime} – {appt.endTime}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-[#697B7B] max-w-xs truncate">
                      {appt.reason || 'General Consultation'}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          appt.status === 'BOOKED'
                            ? 'bg-[#EBF7F2] text-[#0E5B57]'
                            : 'bg-[#FEF2F2] text-[#DC2626]'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {appt.status === 'BOOKED' ? (
                        <button
                          onClick={() => setCancellingAppt(appt)}
                          className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Slot Freed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={!!cancellingAppt}
        onClose={() => setCancellingAppt(null)}
        title="Confirm Appointment Cancellation"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-amber-900 mb-1">
                Release this time slot?
              </p>
              <p className="leading-relaxed">
                Cancelling will change the appointment status to <strong>CANCELLED</strong>. This releases{' '}
                <strong>{cancellingAppt?.doctorName}</strong>'s time slot ({cancellingAppt?.startTime} - {cancellingAppt?.endTime}) so another patient can immediately book it, and restores <strong>{cancellingAppt?.patientName}</strong>'s daily appointment quota.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl space-y-1.5 text-xs text-[#697B7B]">
            <div><strong>Patient:</strong> {cancellingAppt?.patientName}</div>
            <div><strong>Doctor:</strong> {cancellingAppt?.doctorName} ({cancellingAppt?.doctorSpecialization})</div>
            <div><strong>Date:</strong> {cancellingAppt?.appointmentDate}</div>
            <div><strong>Time:</strong> {cancellingAppt?.startTime} – {cancellingAppt?.endTime}</div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCancellingAppt(null)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Keep Appointment
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleConfirmCancel}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>

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
