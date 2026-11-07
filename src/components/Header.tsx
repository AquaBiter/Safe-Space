import React from 'react';
import { HeartHandshake, HelpCircle, LifeBuoy } from 'lucide-react';

interface HeaderProps {
  onOpenCreate?: () => void;
  onOpenGuide: () => void;
  onOpenSupport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenGuide,
  onOpenSupport,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-50/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-700/20">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif text-xl font-bold tracking-tight text-stone-900">
              SafeSpace
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenGuide}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors border border-stone-200"
            title="Community rules & anti-cyberbullying standards"
          >
            <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">Moderation Rules</span>
            <span className="sm:hidden">Rules</span>
          </button>

          <button
            type="button"
            onClick={onOpenSupport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
            title="Support Hotlines and Crisis Resources"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Helplines</span>
          </button>
        </div>
      </div>
    </header>
  );
};
