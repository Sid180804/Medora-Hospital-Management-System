import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getDashboardSummary } from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState('');
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
      setCurrentDate(now.toLocaleDateString('en-US', options));
    };
    updateDate();

    // Check backend connection
    const checkConnection = async () => {
      try {
        await getDashboardSummary();
        setIsConnected(true);
      } catch (e) {
        setIsConnected(false);
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Date display */}
      <div className="flex items-center gap-2 text-sm text-[#697B7B]">
        <Calendar className="w-4 h-4 text-[#126C68]" />
        <span className="font-medium text-[#172B2B]">{currentDate}</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Backend health status badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
            isConnected
              ? 'bg-[#EBF7F2] text-[#0E5B57] border-[#C2E8D7]'
              : 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
          }`}
          title={isConnected ? 'Backend connected to Spring Boot at http://localhost:8080' : 'Disconnected'}
        >
          {isConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#126C68] animate-pulse" />
              <span>Spring Boot 3.x Online</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
              <span>Backend Offline</span>
            </>
          )}
        </div>

        {/* Quick New Appointment Button */}
        <button
          onClick={() => navigate('/book')}
          className="flex items-center gap-2 px-4 py-2 bg-[#126C68] hover:bg-[#0D504D] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Appointment</span>
        </button>
      </div>
    </header>
  );
}
