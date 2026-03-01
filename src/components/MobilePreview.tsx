import { useState } from 'react';
import { Smartphone, X } from 'lucide-react';
import { Button } from './ui/button';

interface MobilePreviewProps {
  visible: boolean;
}

export const MobilePreview = ({ visible }: MobilePreviewProps) => {
  const [open, setOpen] = useState(false);

  if (!visible) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-amber-500 hover:bg-amber-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all"
        title="Preview Mobile"
      >
        <Smartphone className="w-5 h-5" />
      </button>

      {/* Overlay with phone frame */}
      {open && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center" onClick={() => setOpen(false)}>
          <div 
            className="relative bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl"
            style={{ width: '380px', height: '720px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Phone notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10" />
            
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center z-20 shadow-md"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Simulation badge */}
            <div className="absolute -top-10 left-0 right-0 text-center">
              <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                📱 PREVIEW MOBILE — SIMULAÇÃO
              </span>
            </div>
            
            {/* iframe */}
            <iframe
              src="/acompanhar"
              className="w-full h-full rounded-[2rem] bg-white"
              title="Preview Mobile - Acompanhar Pedido"
            />
          </div>
        </div>
      )}
    </>
  );
};
