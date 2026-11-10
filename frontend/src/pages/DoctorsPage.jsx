import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Plus,
  Search,
  Mail,
  Phone,
  Clock,
  CalendarPlus,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { getDoctors, createDoctor } from '../services/api';
import InitialsAvatar from '../components/InitialsAvatar';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

export default function DoctorsPage() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    email: '',
    phone: '',
    consultationDuration: 30,
  });
  const [formError, setFormError] = useState(null);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const data = await getDoctors();
      setDoctors(data);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to load doctors' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'consultationDuration' ? parseInt(value) || '' : value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const newDoc = await createDoctor(formData);
      setToast({ type: 'success', message: `Doctor ${newDoc.name} registered successfully!` });
      setIsModalOpen(false);
      setFormData({
        name: '',
        specialization: '',
        email: '',
        phone: '',
        consultationDuration: 30,
      });
      loadDoctors();
    } catch (err) {
      setFormError(err.message || 'Failed to register doctor');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const q = searchQuery.toLowerCase();
    return (
      doc.name.toLowerCase().includes(q) ||
      doc.specialization.toLowerCase().includes(q) ||
      doc.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#172B2B]">Doctors Directory</h2>
          <p className="text-sm text-[#697B7B] mt-1">
            Browse registered medical specialists, consultation durations, and contact profiles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadDoctors}
            disabled={loading}
            className="p-2 text-[#697B7B] hover:text-[#172B2B] bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh Doctors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#126C68] hover:bg-[#0D504D] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Doctor</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, specialization, or email..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200/90 rounded-xl text-sm placeholder:text-slate-400 focus:outline-hidden focus:border-[#126C68] focus:ring-1 focus:ring-[#126C68] transition-all"
        />
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-48 bg-white border border-slate-200 rounded-2xl animate-pulse p-6" />
          ))}
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#172B2B]">No doctors found</h3>
          <p className="text-xs text-[#697B7B] mt-1">
            {searchQuery ? `No results match "${searchQuery}"` : 'Get started by registering a new doctor.'}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 bg-[#126C68] text-white text-xs font-semibold rounded-lg hover:bg-[#0D504D]"
          >
            Register Doctor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="p-6 bg-white rounded-2xl border border-slate-200/80 card-shadow card-shadow-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-4">
                  <InitialsAvatar name={doc.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-[#172B2B] truncate">{doc.name}</h3>
                    <span className="inline-block mt-1 text-xs font-semibold text-[#126C68] bg-[#DDF2E9] px-2.5 py-0.5 rounded-full">
                      {doc.specialization}
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-2 text-xs text-[#697B7B]">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{doc.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#126C68] shrink-0" />
                    <span className="font-medium text-[#172B2B]">
                      {doc.consultationDuration} min consultation slot
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">ID: #{doc.id}</span>
                <button
                  onClick={() => navigate(`/book?doctorId=${doc.id}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#126C68] bg-[#DDF2E9] hover:bg-[#C8E8DA] rounded-lg transition-colors cursor-pointer"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Book Slot</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register Doctor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormError(null);
        }}
        title="Register New Doctor"
      >
        <form onSubmit={handleRegister} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#172B2B] mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. Dr. Robert Chen"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-[#126C68] focus:ring-1 focus:ring-[#126C68]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172B2B] mb-1">Specialization</label>
            <input
              type="text"
              name="specialization"
              required
              value={formData.specialization}
              onChange={handleInputChange}
              placeholder="e.g. Cardiology, Orthopedics, Pediatrics"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-[#126C68] focus:ring-1 focus:ring-[#126C68]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172B2B] mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="doctor@medora.health"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-[#126C68] focus:ring-1 focus:ring-[#126C68]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#172B2B] mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 000-1111"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-[#126C68] focus:ring-1 focus:ring-[#126C68]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172B2B] mb-1">
              Consultation Duration (Minutes)
            </label>
            <select
              name="consultationDuration"
              value={formData.consultationDuration}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-[#126C68] focus:ring-1 focus:ring-[#126C68]"
            >
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes (Standard)</option>
              <option value={45}>45 Minutes (Specialist)</option>
              <option value={60}>60 Minutes (Comprehensive)</option>
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#126C68] hover:bg-[#0D504D] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Save Doctor'}
            </button>
          </div>
        </form>
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
