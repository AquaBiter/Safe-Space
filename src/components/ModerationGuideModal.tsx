import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Globe, Sparkles } from 'lucide-react';

interface ModerationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModerationGuideModal: React.FC<ModerationGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                AI Moderation & Community Safety
              </h2>
              <p className="text-xs text-stone-500">
                Powered by Google Gemini AI across multiple languages
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
          {/* Mission */}
          <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200/80 space-y-1.5">
            <h3 className="font-semibold text-emerald-950 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              Our Core Philosophy: Dignity, Empathy, and Mutual Growth
            </h3>
            <p className="text-emerald-900 leading-relaxed">
              SafeSpace was founded so people could openly discuss social pressure, anxiety, failure, and self-improvement journeys without fear of cyberbullying. We use Gemini AI to guard this sanctuary 24/7.
            </p>
          </div>

          {/* Critical distinction: Struggle vs Bullying */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 text-sm">
              The Crucial Distinction: Personal Vulnerability vs Bullying
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Always Welcomed (Approved)</span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  Sharing that you feel inadequate, failed an exam, struggle with body image, feel lonely, or crying over family expectations. Your honest pain is welcomed here.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-800">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Prohibited & Deleted (Blocked)</span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  Attacking, insulting, mocking, or degrading someone else. All curse words, veiled profanities (e.g. &quot;what the&quot;), hostile dismissive questioning, and invalidating constructs (e.g. &quot;just who are you&quot;, &quot;who asked&quot;, &quot;who cares&quot;, &quot;cope&quot;, &quot;touch grass&quot;) are strictly prohibited and automatically blocked.
                </p>
              </div>
            </div>
          </div>

          {/* 3 Tier Moderation Engine */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-900 text-sm">
              How Gemini AI Moderation Rules Work
            </h4>

            <div className="space-y-2.5">
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                <div>
                  <span className="font-bold text-stone-900 block">1. Approved (Public Feed)</span>
                  <p className="text-stone-600 mt-0.5">
                    Content passes all safety filters. It provides reflections, questions, vulnerable stories, or supportive comments. Published instantly.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 flex items-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0"></span>
                <div>
                  <span className="font-bold text-stone-900 block">2. Flagged & Hidden (Protected by Shield)</span>
                  <p className="text-stone-600 mt-0.5">
                    Content that contains borderline cynical hostility, passive-aggressive tone, or harsh phrasing. It is shielded behind a warning so readers can choose whether to reveal it.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/50 flex items-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0"></span>
                <div>
                  <span className="font-bold text-stone-900 block">3. Blocked (Zero Tolerance)</span>
                  <p className="text-stone-600 mt-0.5">
                    Severe cyberbullying, targeted malicious harassment, slurs, doxxing, threats, or hate speech. The submission is blocked from being saved or displayed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Multi-language detection */}
          <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-stone-900">
              <Globe className="w-4 h-4 text-emerald-700" />
              <span>Multi-Lingual Protection</span>
            </div>
            <p className="text-stone-600 leading-relaxed">
              Cyberbullying happens in every culture and dialect. SafeSpace’s Gemini AI is trained to detect toxic slurs and hurtful cyberbullying across English, Tagalog / Filipino, Spanish, French, German, Hindi, Japanese, and more.
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
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
