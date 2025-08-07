import React, { useEffect } from "react";

export const ForceDialogStyles = () => {
  useEffect(() => {
    // Create style element for forced dialog styling
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      [data-radix-dialog-content] {
        background-color: white !important;
        color: rgb(17, 24, 39) !important;
        border-color: rgb(229, 231, 235) !important;
      }
      
      .dark [data-radix-dialog-content] {
        background-color: rgb(31, 41, 55) !important;
        color: white !important;
        border-color: rgb(75, 85, 99) !important;
      }
      
      [data-radix-dialog-overlay] {
        background-color: rgba(0, 0, 0, 0.8) !important;
      }
      
      .dark [data-radix-dialog-overlay] {
        background-color: rgba(0, 0, 0, 0.9) !important;
      }
    `;
    
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return null;
};