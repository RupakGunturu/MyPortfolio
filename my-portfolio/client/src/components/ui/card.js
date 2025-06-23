import React from 'react';

export const Card = ({ children, className = '', ...props }) => (
  <div className={`rounded-xl shadow bg-white ${className}`} {...props}>
    {children}
  </div>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
); 