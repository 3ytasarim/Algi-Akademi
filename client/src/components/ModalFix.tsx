import React, { useEffect } from 'react';

export const ModalFix = () => {
  useEffect(() => {
    // Force inject styles directly into document
    const style = document.createElement('style');
    style.textContent = `
      /* Absolute highest priority dialog fixes */
      [data-radix-dialog-content] {
        background: white !important;
        color: #111827 !important;
      }
      
      .dark [data-radix-dialog-content] {
        background: #1f2937 !important;
        color: white !important;
      }
      
      /* Force all child elements */
      [data-radix-dialog-content] *,
      [data-radix-dialog-content] *:before,
      [data-radix-dialog-content] *:after {
        background: inherit !important;
        color: inherit !important;
      }
      
      /* Specific overrides for labels and text */
      .dark [data-radix-dialog-content] label,
      .dark [data-radix-dialog-content] span,
      .dark [data-radix-dialog-content] p,
      .dark [data-radix-dialog-content] h1,
      .dark [data-radix-dialog-content] h2,
      .dark [data-radix-dialog-content] h3,
      .dark [data-radix-dialog-content] h4 {
        color: white !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);
  
  return null;
};