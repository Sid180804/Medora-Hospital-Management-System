import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  CalendarCheck2,
  CalendarPlus,
  CalendarDays,
  Activity,
  Database
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Doctors', path: '/doctors', icon: Stethoscope },
  { name: 'Patients', path: '/patients', icon: Users },
  { name: 'Appointments', path: '/appointments', icon: CalendarCheck2 },
  { name: 'Book Appointment', path: '/book', icon: CalendarPlus },
  { name: 'Schedule', path: '/schedule', icon: CalendarDays },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#126C68] text-white flex items-center justify-center shadow-md shadow-[#126C68]/20">
            <Activity className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#172B2B]">MEDORA</h1>
            <p className="text-[11px] font-medium text-[#697B7B] tracking-wide">Hospital Appointment System</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-[#126C68] font-medium bg-[#DDF2E9] px-2.5 py-1 rounded-md inline-block">
          Care, beautifully coordinated.
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#126C68] text-white shadow-sm shadow-[#126C68]/20'
                    : 'text-[#697B7B] hover:text-[#172B2B] hover:bg-[#F2F6F5]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#697B7B]'}`} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Database & Architecture Note */}
      <div className="p-4 mx-4 mb-6 rounded-xl bg-[#F7F9F8] border border-slate-200/70 text-xs">
        <div className="flex items-center gap-2 text-[#126C68] font-semibold mb-1">
          <Database className="w-3.5 h-3.5" />
          <span>H2 In-Memory DB</span>
        </div>
        <p className="text-[#697B7B] text-[11px] leading-relaxed">
          Resetting automatically on restart. Initialized with demo doctors, patients & appointments.
        </p>
      </div>
    </aside>
  );
}
