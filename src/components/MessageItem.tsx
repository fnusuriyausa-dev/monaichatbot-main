import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { Volume2, BookOpen, Info, Edit2, Copy, Check } from 'lucide-react';

interface MessageItemProps {
  message: ChatMessage;
  onSuggestClick?: (message: ChatMessage) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onSuggestClick }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isError = message.isError;

  const handleCopy = () => {
    if (message.data?.translation) {
      navigator.clipboard.writeText(message.data.translation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-[85%] sm:max-w-[75%] bg-blue-600 text-white rounded-2xl rounded-tr-none px-5 py-3 shadow-md">
          <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-start mb-6 w-full">
         <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3 flex-shrink-0 text-red-600">
           <Info size={16} />
         </div>
        <div className="max-w-[85%] bg-red-50 text-red-700 rounded-2xl rounded-tl-none px-5 py-3 border border-red-100">
          <p>Sorry, I encountered an error processing your request.</p>
        </div>
      </div>
    );
  }

  const data = message.data;

  // Fallback if data is missing but it's not explicitly an error
  if (!data) {
    return (
      <div className="flex justify-start mb-6">
        <div className="max-w-[85%] bg-white text-slate-800 rounded-2xl rounded-tl-none px-5 py-3 shadow-sm border border-slate-200">
          <p>{message.rawResponse || "..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-8 w-full animate-fade-in-up group">
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0 text-blue-700 mt-1">
        <span className="font-bold text-xs">MT</span>
      </div>
      
      <div className="flex-1 max-w-2xl">
        <div className="bg-white rounded-2xl rounded-tl-none shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Header - Source Language & Actions */}
          <div className="bg-slate-50 px-5 py-2 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <BookOpen size={14} />
              <span>Translated from {data.source_language}</span>
            </div>
            
            {/* Actions - ALWAYS VISIBLE NOW */}
            <div className="flex items-center gap-3">
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 px-2 py-1 rounded transition-colors"
                title="Copy translation"
              >
                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                <span className={copied ? "text-green-600" : ""}>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {onSuggestClick && (
                <button 
                  onClick={() => onSuggestClick(message)}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 px-2 py-1 rounded transition-colors"
                  title="Suggest a better translation"
                >
                  <Edit2 size={14} />
                  <span>Suggest Fix</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-5 space-y-4">
            
            {/* Main Translation */}
            <div>
              <h3 className="text-xl sm:text-2xl font-medium text-slate-900 font-myanmar leading-relaxed">
                {data.translation}
              </h3>
            </div>

            {/* Romanization */}
            {data.romanization && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg text-blue-900">
                <Volume2 size={18} className="mt-1 flex-shrink-0 opacity-60" />
                <div className="text-sm sm:text-base italic font-medium opacity-90">
                  {data.romanization}
                </div>
              </div>
            )}

            {/* Cultural Notes */}
            {data.notes && (
              <div className="pt-2 border-t border-slate-100 mt-2">
                <div className="flex items-start gap-2 text-slate-600">
                  <Info size={16} className="mt-1 flex-shrink-0 text-blue-600" />
                  <p className="text-sm leading-relaxed">{data.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
