import React from 'react';

const COLORS = [
  { bg: 'bg-[#E0F2F1]', text: 'text-[#126C68]', border: 'border-[#B2DFDB]' },
  { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]', border: 'border-[#C8E6C9]' },
  { bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]', border: 'border-[#BBDEFB]' },
  { bg: 'bg-[#F3E5F5]', text: 'text-[#7B1FA2]', border: 'border-[#E1BEE7]' },
  { bg: 'bg-[#FFF3E0]', text: 'text-[#E65100]', border: 'border-[#FFE0B2]' },
  { bg: 'bg-[#F1F5F9]', text: 'text-[#475569]', border: 'border-[#E2E8F0]' },
];

export default function InitialsAvatar({ name = '', size = 'md', className = '' }) {
  const getInitials = (str) => {
    if (!str) return 'M';
    const cleanStr = str.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s*/i, '').trim();
    const parts = cleanStr.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const color = COLORS[getHash(name) % COLORS.length];

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs font-semibold',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-12 h-12 text-base font-bold',
    xl: 'w-16 h-16 text-xl font-bold',
  }[size] || 'w-10 h-10 text-sm font-semibold';

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full border ${color.bg} ${color.text} ${color.border} select-none ${sizeClasses} ${className}`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
