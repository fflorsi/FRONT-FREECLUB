import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle }) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 ${className}`}>
      {(title || subtitle) && (
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100">
          {title && <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-xs sm:text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;