
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  // FIX: Add style prop to allow dynamic styling and fix the error in DashboardView.
  style?: React.CSSProperties;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick, style }) => {
  return (
    <div
      onClick={onClick}
      style={style}
      className={`glass-card rounded-2xl p-6 shadow-2xl transition-all duration-300 ease-in-out ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;
