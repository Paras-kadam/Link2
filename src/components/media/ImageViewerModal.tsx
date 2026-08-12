import React from 'react';
import { X, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ImageViewerModal: React.FC = () => {
  const { activeLightboxImage, setActiveLightboxImage, showToast } = useApp();

  if (!activeLightboxImage) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#050505]/95 flex flex-col justify-between p-4 md:p-6 select-none font-mono">
      {/* Lightbox Header Bar */}
      <div className="flex items-center justify-between w-full z-10">
        <span className="text-[11px] text-[#666666] bg-[#0A0A0A] px-2.5 py-1 rounded border border-[#1C1C1C] uppercase">
          // ENCRYPTED IMAGE VIEWER
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => showToast('Image Saved', 'Saved photo to device.', 'info')}
            className="p-2 rounded bg-[#0A0A0A] hover:bg-[#151515] text-[#a0a0a0] border border-[#1C1C1C] transition-colors"
            title="Download Image"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveLightboxImage(null)}
            className="p-2 rounded bg-[#0A0A0A] hover:bg-[#151515] text-[#a0a0a0] border border-[#1C1C1C] transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Center Image */}
      <div className="flex-1 flex items-center justify-center my-4 overflow-hidden">
        <img
          src={activeLightboxImage}
          alt="Expanded Media"
          className="max-w-full max-h-[80vh] object-contain rounded border border-[#1C1C1C]"
        />
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-[#666666]">
        Press close or click outside to dismiss
      </div>
    </div>
  );
};
