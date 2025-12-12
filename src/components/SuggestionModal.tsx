import React, { useState } from 'react';
import { X, Save, MessageSquarePlus } from 'lucide-react';

// ✅ Import backend API helper
import { submitSuggestion } from "../services/suggestions";

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  currentTranslation: string;
}

export const SuggestionModal: React.FC<SuggestionModalProps> = ({
  isOpen,
  onClose,
  originalText,
  currentTranslation,
}) => {
  const [suggestion, setSuggestion] = useState(currentTranslation);
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!suggestion.trim()) return;

    try {
      setLoading(true);

      // ✅ Send suggestion to backend
      await submitSuggestion(
        originalText,
        suggestion.trim(),
        context.trim()
      );

      onClose();
    } catch (err) {
      console.error("Failed to save suggestion:", err);
      alert("Failed to save suggestion. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-slate-800">
            <MessageSquarePlus size={20} className="text-blue-600" />
            <h3 className="font-semibold text-lg">Suggest Improvement</h3>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-200 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Original Text */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Original Text
            </label>
            <div className="p-3 bg-slate-50 rounded-lg text-slate-700 text-sm border border-slate-100">
              {originalText}
            </div>
          </div>

          {/* Suggestion Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Your Suggestion
            </label>
            <textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-myanmar min-h-[80px]"
              placeholder="Type the correct translation here..."
              autoFocus
            />
          </div>

          {/* Context */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between">
              <span>Context (Optional)</span>
              <span className="font-normal normal-case text-slate-400">
                e.g. "Use formal tone", "Specific dialect"
              </span>
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="When should I use this?"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!suggestion.trim() || loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm shadow-blue-600/20 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : (
                <>
                  <Save size={18} />
                  Submit to Admin
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-3 bg-blue-50 border-t border-blue-100 text-xs text-blue-800">
          <p>Your suggestion will be reviewed by an admin before going live.</p>
        </div>
      </div>
    </div>
  );
};
