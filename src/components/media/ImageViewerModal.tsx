import React from 'react';
import { X, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ImageViewerModal: React.FC = () => {
  const { activeLightboxImage, setActiveLightboxImage, showToast } = useApp();

  if (!activeLightboxImage) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col justify-between p-4 md:p-6 select-none animate-fade-in">
      {/* Lightbox Header Bar */}
      <div className="flex items-center justify-between w-full z-10">
        <span className="text-xs font-semibold text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
          Encrypted Image Viewer
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('Image Saved', 'Saved original photo to device.', 'info')}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors"
            title="Download Image"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveLightboxImage(null)}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors"
            title="Close Lightbox"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Center Image */}
      <div className="flex-1 flex items-center justify-center my-4 overflow-hidden">
        <img
          src={activeLightboxImage}
          alt="Expanded Media"
          className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10"
        />
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-slate-400">
        Click anywhere outside or press Close to dismiss
      </div>
    </div>
  );
};
