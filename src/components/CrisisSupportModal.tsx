import React, { useState, useEffect } from 'react';
import { X, LifeBuoy, Phone, Heart, Sparkles, Wind } from 'lucide-react';

interface CrisisSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrisisSupportModal: React.FC<CrisisSupportModalProps> = ({ isOpen, onClose }) => {
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathingSeconds, setBreathingSeconds] = useState(4);

  useEffect(() => {
    if (!isOpen) return;

    let timer: any;
    let count = 4;
    let phase: 'Inhale' | 'Hold' | 'Exhale' = 'Inhale';

    timer = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        if (phase === 'Inhale') {
          phase = 'Hold';
          count = 7;
        } else if (phase === 'Hold') {
          phase = 'Exhale';
          count = 8;
        } else {
          phase = 'Inhale';
          count = 4;
        }
        setBreathingPhase(phase);
      }
      setBreathingSeconds(count);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-rose-50/70 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
              <LifeBuoy className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Support & Crisis Resources
              </h2>
              <p className="text-xs text-stone-500">
                You are valuable, and you don't have to carry this alone.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs text-stone-700 max-h-[75vh] overflow-y-auto">
          {/* Breathing Circle Widget */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-stone-50 to-emerald-50/40 border border-stone-200 text-center space-y-3">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-800">
              <Wind className="w-4 h-4 text-emerald-600" />
              <span>4-7-8 Calming Breath Practice</span>
            </div>
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                  breathingPhase === 'Inhale'
                    ? 'scale-110 bg-emerald-200/60 border-2 border-emerald-400'
                    : breathingPhase === 'Hold'
                    ? 'scale-110 bg-indigo-200/60 border-2 border-indigo-400'
                    : 'scale-90 bg-stone-200/60 border-2 border-stone-400'
                }`}
              />
              <div className="relative z-10 text-center">
                <span className="block font-bold text-stone-900 text-sm">{breathingPhase}</span>
                <span className="text-xl font-bold text-emerald-900">{breathingSeconds}s</span>
              </div>
            </div>
            <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
              Whenever feelings of panic or pressure rise, take a moment to regulate your nervous system.
            </p>
          </div>

          {/* Worldwide Helplines */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-rose-600" />
              Free, Confidential 24/7 Helplines
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/50">
                <span className="font-bold text-stone-900 block">USA & Canada</span>
                <span className="text-emerald-700 font-semibold block text-sm mt-0.5">Dial 988</span>
                <span className="text-stone-500 text-[11px]">Suicide & Crisis Lifeline (Call or Text)</span>
              </div>

              <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/50">
                <span className="font-bold text-stone-900 block">United Kingdom</span>
                <span className="text-emerald-700 font-semibold block text-sm mt-0.5">Dial 111 or 999</span>
                <span className="text-stone-500 text-[11px]">Samaritans UK: 116 123</span>
              </div>

              <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/50">
                <span className="font-bold text-stone-900 block">Philippines</span>
                <span className="text-emerald-700 font-semibold block text-sm mt-0.5">Dial 1553</span>
                <span className="text-stone-500 text-[11px]">National Center for Mental Health Crisis Hotline</span>
              </div>

              <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/50">
                <span className="font-bold text-stone-900 block">International / Global</span>
                <span className="text-emerald-700 font-semibold block text-sm mt-0.5">findahelpline.com</span>
                <span className="text-stone-500 text-[11px]">Free, confidential support in over 130 countries</span>
              </div>
            </div>
          </div>

          {/* Grounding Reminder */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
            <Heart className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              Remember: Social pressure, comparison, and temporary setbacks do not define your worth. Progress in life is never a straight line.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-stone-800 hover:bg-stone-900 rounded-lg transition-colors"
          >
            Close Support Panel
          </button>
        </div>
      </div>
    </div>
  );
};
