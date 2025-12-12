import React from 'react';
import { X, Heart, Coffee, Globe } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in relative">
        
        {/* Decorative Background Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center relative overflow-hidden">
          {/* Subtle pattern overlay */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          
          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm shadow-lg relative z-10">
            <Heart className="text-white fill-white animate-pulse" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-1 relative z-10">ထံက်ပင် ပရေင်ကမၠောန် ပိုယ် ညိ</h3>
          <p className="text-blue-100 text-sm relative z-10">ရီုဗင် မင်မွဲ ဘာသာမန် ညိ။</p>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/10 hover:bg-black/20 rounded-full p-1 transition-all z-20"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-slate-600 text-center leading-relaxed">
            MT is a community-driven project. Your support helps us cover hosting, server, and API costs and continue developing tools to keep the Mon language alive in the digital age.
          </p>

          <div className="grid gap-4">
            {/* Financial Support Option */}
            <a 
              href="https://www.facebook.com/nai.suriyamon/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 border border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Coffee size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 group-hover:text-blue-700">Donate Funds</h4>
                <p className="text-xs text-slate-500">Support server & development costs</p>
              </div>
            </a>

            {/* Contribution Support Option */}
            <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-2xl bg-slate-50">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <Globe size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900">Contribute Knowledge</h4>
                <p className="text-xs text-slate-500">Use "Suggest Fix" in chat to teach the AI</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
          <p className="text-xs text-slate-400">
            နကဵုဓဝ် ❤️ မေတ္တာ သြဝ်ဘိုၚ်မၚ်မွဲ <span className="font-bold text-slate-600">ဘာသာမန်ညိ</span>
          </p>
        </div>
      </div>
    </div>
  );

};
