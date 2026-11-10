import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Users,
  CalendarCheck2,
  CalendarX2,
  ArrowRight,
  Clock,
  User,
  PlusCircle,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { getDashboardSummary, getDashboardTrends, getAppointments } from '../services/api';
import InitialsAvatar from '../components/InitialsAvatar';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const [sumData, trendsData, apptsData] = await Promise.all([
        getDashboardSummary(),
        getDashboardTrends(),
        getAppointments({ date: todayStr }),
      ]);
      setSummary(sumData);
      setTrends(trendsData);
      setTodayAppointments(apptsData);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const statCards = [
    {
      title: 'Total Doctors',
      value: summary?.totalDoctors ?? 0,
      subtext: 'Specialists & Physicians',
      icon: Stethoscope,
      accent: 'bg-[#EBF7F2] text-[#126C68]',
      link: '/doctors',
    },
    {
      title: 'Total Patients',
      value: summary?.totalPatients ?? 0,
      subtext: 'Registered individuals',
      icon: Users,
      accent: 'bg-[#EFF6FF] text-[#2563EB]',
      link: '/patients',
    },
    {
      title: "Today's Appointments",
      value: summary?.todayAppointments ?? 0,
      subtext: 'Active scheduled consultations',
      icon: CalendarCheck2,
      accent: 'bg-[#F0FDF4] text-[#16A34A]',
      link: '/appointments',
    },
    {
      title: 'Cancelled Slots',
      value: summary?.cancelledAppointments ?? 0,
      subtext: 'Freed for rebooking',
      icon: CalendarX2,
      accent: 'bg-[#FEF2F2] text-[#DC2626]',
      link: '/appointments',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#172B2B]">Hospital Overview</h2>
          <p className="text-sm text-[#697B7B] mt-1">
            Real-time scheduling metrics and patient activity powered by Spring Boot & H2.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-[#172B2B] bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 text-[#697B7B] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate('/book')}
            className="flex items-center gap-2 px-4 py-2 bg-[#126C68] hover:bg-[#0D504D] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Error alert if backend is unreachable */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Connection Warning</h4>
            <p className="text-sm mt-0.5">{error}</p>
          </div>
          <button
            onClick={loadData}
            className="text-xs font-semibold px-3 py-1 bg-white border border-red-300 rounded-lg text-red-700 hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(card.link)}
              className="p-5 bg-white rounded-2xl border border-slate-200/80 card-shadow card-shadow-hover cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#697B7B] uppercase tracking-wider">
                    {card.title}
                  </span>
                  <div className="text-3xl font-extrabold text-[#172B2B] mt-2">
                    {loading ? (
                      <div className="h-8 w-16 bg-slate-200 animate-pulse rounded-md" />
                    ) : (
                      card.value
                    )}
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${card.accent}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#697B7B]">
                <span>{card.subtext}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid: Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend Chart (2 columns on large screens) */}
        <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-slate-200/80 card-shadow flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[#172B2B]">Weekly Appointment Volume</h3>
              <p className="text-xs text-[#697B7B]">
                Comparing booked vs cancelled consultations across a 7-day window
              </p>
            </div>
            <span className="text-xs font-medium text-[#126C68] bg-[#DDF2E9] px-2.5 py-1 rounded-full">
              Live API Trends
            </span>
          </div>

          <div className="h-72 w-full">
            {loading ? (
              <div className="h-full w-full bg-slate-50 animate-pulse rounded-xl flex items-center justify-center text-slate-400 text-sm">
                Loading appointment trends...
              </div>
            ) : trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="dayName" stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="booked" name="Booked" fill="#126C68" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cancelled" name="Cancelled" fill="#F87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No trend data available.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & System Info */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 card-shadow flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#172B2B] mb-1">Quick Actions</h3>
            <p className="text-xs text-[#697B7B] mb-4">Fast-track key operational tasks</p>
            <div className="space-y-2.5">
              <button
                onClick={() => navigate('/book')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-[#126C68] hover:bg-[#F7FAF9] transition-all text-left text-sm font-medium text-[#172B2B] group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#DDF2E9] text-[#126C68] flex items-center justify-center">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#172B2B]">Book Appointment</div>
                    <div className="text-[11px] text-[#697B7B]">New patient consultation</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#126C68] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => navigate('/doctors')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-[#126C68] hover:bg-[#F7FAF9] transition-all text-left text-sm font-medium text-[#172B2B] group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#172B2B]">Register Doctor</div>
                    <div className="text-[11px] text-[#697B7B]">Add clinician & duration</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#126C68] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => navigate('/patients')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-[#126C68] hover:bg-[#F7FAF9] transition-all text-left text-sm font-medium text-[#172B2B] group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#172B2B]">Register Patient</div>
                    <div className="text-[11px] text-[#697B7B]">Create patient profile</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#126C68] group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>

          {/* Academic Architecture Badge */}
          <div className="p-4 rounded-xl bg-[#F7F9F8] border border-slate-200/80 text-xs">
            <span className="font-semibold text-[#126C68] block mb-1">Architecture Note</span>
            <p className="text-[#697B7B] leading-relaxed">
              Demonstrates 3-layer architecture: Controller → Service → Repository. Conflict checks and patient daily limits are strictly enforced.
            </p>
          </div>
        </div>
      </div>

      {/* Today's Appointments Table */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 card-shadow">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-[#172B2B]">Today's Scheduled Consultations</h3>
            <p className="text-xs text-[#697B7B]">Live list of consultations for the current calendar date</p>
          </div>
          <button
            onClick={() => navigate('/appointments')}
            className="text-xs font-semibold text-[#126C68] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Appointments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-12 bg-slate-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : todayAppointments.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-[#172B2B]">No appointments today</h4>
            <p className="text-xs text-[#697B7B] mt-1">Book a new appointment to see it reflected here in real time.</p>
            <button
              onClick={() => navigate('/book')}
              className="mt-4 px-4 py-2 bg-[#126C68] text-white text-xs font-semibold rounded-lg hover:bg-[#0D504D]"
            >
              Book Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-[#697B7B] uppercase tracking-wider">
                  <th className="pb-3 px-3">Patient</th>
                  <th className="pb-3 px-3">Doctor</th>
                  <th className="pb-3 px-3">Time</th>
                  <th className="pb-3 px-3">Reason</th>
                  <th className="pb-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <InitialsAvatar name={appt.patientName} size="sm" />
                        <span className="font-semibold text-[#172B2B]">{appt.patientName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-medium text-[#172B2B]">{appt.doctorName}</div>
                      <div className="text-xs text-[#697B7B]">{appt.doctorSpecialization}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#172B2B] bg-slate-100 px-2 py-0.5 rounded-md">
                        <Clock className="w-3 h-3 text-[#126C68]" />
                        {appt.startTime} – {appt.endTime}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-[#697B7B] max-w-xs truncate">
                      {appt.reason || 'General Consultation'}
                    </td>
                    <td className="py-3.5 px-3">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
