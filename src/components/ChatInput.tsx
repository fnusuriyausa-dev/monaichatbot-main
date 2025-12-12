import React, { useState, useRef } from 'react';
import { Send, Sparkles, Heart, AlertCircle } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  onSupportClick: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled, onSupportClick }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const WORD_LIMIT = 30;

  // Calculate word count: split by whitespace and filter out empty strings
  const wordCount = input.trim() === '' ? 0 : input.trim().split(/\s+/).filter(w => w.length > 0).length;
  const isOverLimit = wordCount > WORD_LIMIT;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !disabled && !isOverLimit) {
      onSend(input.trim());
      setInput('');
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 pb-6 z-10">
      <div className="max-w-3xl mx-auto relative">
        <form 
          onSubmit={handleSubmit} 
          className={`relative flex items-end gap-2 bg-white rounded-2xl shadow-lg border p-2 focus-within:ring-2 transition-all ${
            isOverLimit 
              ? 'border-red-300 focus-within:ring-red-100' 
              : 'border-slate-200 focus-within:ring-blue-500/20'
          }`}
        >
          <div className="relative w-full">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask MT to translate..."
              className="w-full bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400 resize-none py-3 px-3 pb-6 max-h-32 font-myanmar"
              rows={1}
              disabled={disabled}
              style={{ minHeight: '44px' }}
            />
            
            {/* Word Counter */}
            <div className={`absolute bottom-1 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 pointer-events-none ${
              isOverLimit 
                ? 'bg-red-100 text-red-600' 
                : wordCount > 20 
                  ? 'bg-orange-50 text-orange-500' 
                  : 'text-slate-300'
            }`}>
              {isOverLimit && <AlertCircle size={10} />}
              <span>{wordCount}/{WORD_LIMIT} words</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!input.trim() || disabled || isOverLimit}
            className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl transition-colors mb-1 shadow-sm ${
              isOverLimit 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white'
            }`}
          >
            {disabled ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
        
        {/* Footer with Support Animation */}
        <div className="mt-3 flex flex-col items-center gap-1.5">
            <button 
              onClick={onSupportClick}
              className="group flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 px-3 py-1 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-sm"
            >
               <Heart size={10} className="text-rose-500 animate-pulse" />
               <span>Support this Project</span>
            </button>
            
            <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              @2025 DEVELOPED BY <a href="https://www.facebook.com/nai.suriyamon/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline transition-colors font-medium">NSUMON</a>
            </p>
        </div>
      </div>
    </div>
  );
};
