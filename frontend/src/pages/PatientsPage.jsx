import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  User,
  CalendarPlus,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { getPatients, createPatient } from '../services/api';
import InitialsAvatar from '../components/InitialsAvatar';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

export default function PatientsPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
  });
  const [formError, setFormError] = useState(null);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to load patients' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' ? (value === '' ? '' : parseInt(value)) : value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const newPatient = await createPatient(formData);
      setToast({ type: 'success', message: `Patient ${newPatient.name} registered successfully!` });
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        age: '',
      });
      loadPatients();
    } catch (err) {
      setFormError(err.message || 'Failed to register patient');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPatients = patients.filter((pat) => {
    const q = searchQuery.toLowerCase();
    return (
      pat.name.toLowerCase().includes(q) ||
      pat.email.toLowerCase().includes(q) ||
      pat.phone.includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#172B2B]">Patient Directory</h2>
          <p className="text-sm text-[#697B7B] mt-1">
            Registered patients, contact information, and daily appointment quotas (max 2 per day).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadPatients}
            disabled={loading}
            className="p-2 text-[#697B7B] hover:text-[#172B2B] bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh Patients"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#126C68] hover:bg-[#0D504D] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Patient</span>
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
          placeholder="Search by patient name, email, or phone..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200/90 rounded-xl text-sm placeholder:text-slate-400 focus:outline-hidden focus:border-[#126C68] focus:ring-1 focus:ring-[#126C68] transition-all"
        />
      </div>

      {/* Patients Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 card-shadow overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-12 bg-slate-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[#172B2B]">No patients found</h3>
            <p className="text-xs text-[#697B7B] mt-1">
              {searchQuery ? `No patient matches "${searchQuery}"` : 'Register your first patient to begin scheduling.'}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 bg-[#126C68] text-white text-xs font-semibold rounded-lg hover:bg-[#0D504D]"
            >
              Register Patient
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-[#FBFDFD] text-[11px] font-semibold text-[#697B7B] uppercase tracking-wider">
                  <th className="py-3.5 px-6">Patient</th>
                  <th className="py-3.5 px-6">Age</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Phone</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((pat) => (
                  <tr key={pat.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <InitialsAvatar name={pat.name} size="md" />
                        <div>
                          <span className="font-semibold text-[#172B2B] block">{pat.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">Patient ID: #{pat.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-[#172B2B] text-xs font-medium rounded-md">
                        {pat.age} yrs
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-[#697B7B]">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{pat.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-[#697B7B]">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{pat.phone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => navigate(`/book?patientId=${pat.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#126C68] bg-[#DDF2E9] hover:bg-[#C8E8DA] rounded-lg transition-colors cursor-pointer"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                        <span>Book</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Patient Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormError(null);
        }}
        title="Register New Patient"
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
              placeholder="e.g. Samantha Miller"
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
                placeholder="patient@example.com"
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
                placeholder="+1 (555) 234-5678"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-[#126C68] focus:ring-1 focus:ring-[#126C68]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172B2B] mb-1">Age</label>
            <input
              type="number"
              name="age"
              min="0"
              max="125"
              required
              value={formData.age}
              onChange={handleInputChange}
              placeholder="e.g. 34"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-[#126C68] focus:ring-1 focus:ring-[#126C68]"
            />
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
              {submitting ? 'Registering...' : 'Save Patient'}
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
