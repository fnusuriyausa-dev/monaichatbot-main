import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { MessageItem } from './MessageItem';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: ChatMessage[];
  isThinking: boolean;
  onSuggestClick: (message: ChatMessage) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isThinking, onSuggestClick }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-8 pb-48">
      <div className="max-w-3xl mx-auto">
        {messages.length === 0 && (
          <div className="text-center py-20 opacity-60">
            <div className="w-20 h-20 bg-[#2563eb]/10 text-[#2563eb] rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-sm border border-[#2563eb]/20">
                <span className="text-3xl font-bold">MT</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">MT TRANSLATOR</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              ကၠာဲစၠောအ် ဘာသာ အကြာ အၚ်္ဂလိက် ကေုာံ မန် ၊ ကၠာဲစမ်ရံင် မွဲဝါ ညိ။
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageItem 
            key={msg.id} 
            message={msg} 
            onSuggestClick={msg.role === 'model' && !msg.isError ? onSuggestClick : undefined}
          />
        ))}

        {isThinking && (
          <div className="flex justify-start mb-8 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-[#2563eb]/10 flex items-center justify-center mr-3 flex-shrink-0 text-[#2563eb] mt-1">
                <span className="font-bold text-xs">MT</span>
            </div>
            <TypingIndicator />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
