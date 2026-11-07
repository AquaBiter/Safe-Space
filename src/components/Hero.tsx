import React from 'react';
import { ShieldCheck, Globe, Feather, HeartHandshake } from 'lucide-react';

interface HeroProps {
  onOpenCreate: () => void;
  onOpenGuide?: () => void;
  postCount: number;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCreate }) => {
  return (
    <section className="pt-8 pb-6 border-b border-stone-200 bg-gradient-to-b from-stone-100/60 to-transparent">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            A Safe Anonymous Sanctuary
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 tracking-tight leading-tight">
            Speak your truth without fear of judgment or cyberbullying.
          </h1>
          <p className="mt-3 text-base sm:text-lg text-stone-600 leading-relaxed font-sans">
            SafeSpace is an open, anonymous blog for sharing personal self-improvement journeys, struggles with social expectations, and quiet victories. Protected 24/7 by multi-lingual Gemini AI moderation to ensure kindness, safety, and mutual support.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition-all shadow-sm shadow-emerald-900/15"
            >
              <Feather className="w-4 h-4" />
              Write an Anonymous Reflection
            </button>
          </div>

          {/* Value props without pill boxes */}
          <div className="mt-8 pt-6 border-t border-stone-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-600">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded bg-stone-100 text-stone-800 shrink-0">
                <HeartHandshake className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <span className="font-semibold text-stone-900 block">No Signup Required</span>
                <span>Post instantly under your chosen pseudonym or in total anonymity.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded bg-stone-100 text-stone-800 shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <span className="font-semibold text-stone-900 block">AI Cyberbullying Guard</span>
                <span>Gemini blocks attacks and personal insults before they hurt anyone.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded bg-stone-100 text-stone-800 shrink-0">
                <Globe className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <span className="font-semibold text-stone-900 block">Multi-Lingual Empathy</span>
                <span>Understands reflections and flags harassment across diverse languages.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
