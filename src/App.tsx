import React, { useState, useEffect } from 'react';
import { ChatMessage, VocabularyItem } from './types';
import { sendMessageToGemini } from './services/gemini';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import { SuggestionModal } from './components/SuggestionModal';
import { SupportModal } from './components/SupportModal';
import { Notification, NotificationType } from './components/Notification';
import { Brain, Shield, Lock, CheckCircle, XCircle, LogOut, Loader2 } from 'lucide-react';
import { auth, db } from './services/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, updateDoc, doc } from "firebase/firestore";

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [approvedVocabulary, setApprovedVocabulary] = useState<VocabularyItem[]>([]);
  
  // Auth & Admin State
  const [user, setUser] = useState<User | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [pendingSuggestions, setPendingSuggestions] = useState<VocabularyItem[]>([]);
  
  // Login Modal State
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Suggestion Modal State
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{original: string, current: string} | null>(null);

  // Support Modal State (New)
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Notification State
  const [notification, setNotification] = useState<{message: string, type: NotificationType} | null>(null);

  // Helper to show notification
  const showNotification = (message: string, type: NotificationType) => {
    setNotification({ message, type });
  };

  // 1. Listen for Auth Changes
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setIsAdminMode(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Listen for Approved Vocabulary (For Chatbot Context)
  useEffect(() => {
    if (!db) return;
    try {
      const q = query(collection(db, 'suggestions'), where('status', '==', 'approved'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const vocab = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as VocabularyItem[];
        setApprovedVocabulary(vocab);
      }, (err) => {
        console.log("Firestore offline or permission denied, skipping vocabulary sync.");
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Error setting up vocabulary listener:", e);
    }
  }, []);

  // 3. Listen for Pending Suggestions (Only if Admin Mode is Active)
  useEffect(() => {
    if (!user || !isAdminMode || !db) return;
    
    try {
      const q = query(collection(db, 'suggestions'), where('status', '==', 'pending'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const pending = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as VocabularyItem[];
        setPendingSuggestions(pending);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Error setting up pending listener:", e);
    }
  }, [user, isAdminMode]);

  const handleSendMessage = async (text: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    try {
      // Pass vocabulary to the service
      const data = await sendMessageToGemini(text);
      
      const modelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        data,
        timestamp: Date.now(),
      };
      
      setMessages((prev) => [...prev, modelMessage]);

      // Save to Firestore
      if (db) {
         try {
           const conversationId = userMessage.id; 
           await addDoc(collection(db, 'conversations'), {
             sessionId: conversationId, 
             input: text,
             response: data, 
             timestamp: serverTimestamp(),
             metadata: {
               client: 'web_v6',
               hasVocabularyContext: approvedVocabulary.length > 0
             }
           });
         } catch (saveError) {
           console.error("Failed to save conversation history:", saveError);
         }
       }

    } catch (error) {
      console.error("Failed to get response", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        timestamp: Date.now(),
        isError: true
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleOpenSuggestion = (modelMessage: ChatMessage) => {
    const index = messages.findIndex(m => m.id === modelMessage.id);
    if (index > 0) {
      const userMessage = messages[index - 1];
      if (userMessage.role === 'user' && userMessage.text && modelMessage.data?.translation) {
        setModalData({
          original: userMessage.text,
          current: modelMessage.data.translation
        });
        setIsSuggestModalOpen(true);
      }
    }
  };

  const handleSubmitSuggestion = async (original: string, suggestion: string, context: string) => {
    if (!db) {
      showNotification("Database connection not available. Please check your configuration.", "error");
      return;
    }
    try {
      await addDoc(collection(db, 'suggestions'), {
        original,
        suggestion,
        context,
        status: 'pending',
        timestamp: serverTimestamp()
      });
      showNotification("Thank you! Your suggestion has been sent to the admin for review.", "success");
    } catch (error) {
      console.error("Error submitting suggestion:", error);
      showNotification("Failed to submit suggestion. Please try again.", "error");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setLoginError("Auth service not initialized");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowLogin(false);
      setEmail('');
      setPassword('');
      setLoginError('');
      setIsAdminMode(true);
      showNotification("Welcome back, Admin!", "success");
    } catch (err) {
      setLoginError("Invalid email or password");
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      setIsAdminMode(false);
      showNotification("Logged out successfully.", "success");
    }
  };

  const handleApprove = async (id: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'suggestions', id), { status: 'approved' });
      showNotification("Suggestion approved and added to dictionary.", "success");
    } catch (e) { 
      console.error(e);
      showNotification("Failed to approve suggestion.", "error");
    }
  };

  const handleReject = async (id: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'suggestions', id), { status: 'rejected' });
      showNotification("Suggestion rejected.", "success");
    } catch (e) { 
      console.error(e);
      showNotification("Failed to reject suggestion.", "error");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Global Notification */}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Brand Logo - Updated to Request */}
          <div className="flex items-center space-x-2 select-none">
            <span className="text-xl font-bold text-slate-900 tracking-tight">MT</span>
            <span className="text-xl font-bold text-[#2563eb] border-2 border-[#2563eb] px-2 py-0.5 rounded-md tracking-tight">
              NSUMON
            </span>
          </div>

          <div className="flex items-center gap-3">
             {/* Stats for everyone */}
            {approvedVocabulary.length > 0 && !isAdminMode && (
              <div className="hidden sm:flex items-center gap-1 text-xs text-[#2563eb] bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                 <Brain size={12} />
                 <span>{approvedVocabulary.length} Terms</span>
              </div>
            )}

            {/* Admin Toggle */}
            {user ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsAdminMode(!isAdminMode)}
                  className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${isAdminMode ? 'bg-[#2563eb] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  <Shield size={12} />
                  {isAdminMode ? 'Admin Mode' : 'Admin'}
                </button>
                <button onClick={handleLogout} className="text-slate-400 hover:text-red-500">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowLogin(true)}
                className="text-slate-400 hover:text-[#2563eb] transition-colors"
                title="Admin Login"
              >
                <Lock size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
        
        {/* Admin Dashboard Overlay */}
        {isAdminMode && (
          <div className="absolute inset-0 z-10 bg-slate-50 flex flex-col items-center p-4 overflow-y-auto">
             <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-8 animate-fade-in-up">
                <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
                  <h2 className="font-bold flex items-center gap-2"><Shield size={18}/> Pending Suggestions</h2>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">{pendingSuggestions.length} Pending</span>
                </div>
                
                {pendingSuggestions.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <CheckCircle className="mx-auto mb-3 opacity-20" size={48} />
                    <p>No pending suggestions to review.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {pendingSuggestions.map((item) => (
                      <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase text-slate-400 bg-slate-100 px-1.5 rounded">Original</span>
                            <span className="font-medium text-slate-700">{item.original}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase text-[#2563eb] bg-blue-50 px-1.5 rounded">Suggest</span>
                            <span className="font-medium text-slate-900 font-myanmar text-lg">{item.suggestion}</span>
                          </div>
                          {item.context && (
                             <p className="text-xs text-slate-500 italic mt-1">Context: {item.context}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleApprove(item.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-medium transition-colors"
                          >
                            <CheckCircle size={16} /> Approve
                          </button>
                          <button 
                            onClick={() => handleReject(item.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                          >
                            <XCircle size={16} /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>
        )}

        {/* Chat UI */}
        <MessageList 
          messages={messages} 
          isThinking={isThinking} 
          onSuggestClick={handleOpenSuggestion}
        />
        <ChatInput 
            onSend={handleSendMessage} 
            disabled={isThinking || isAdminMode} 
            onSupportClick={() => setIsSupportModalOpen(true)}
        />
      </main>

      {/* Suggestion Modal */}
      {modalData && (
        <SuggestionModal
          isOpen={isSuggestModalOpen}
          onClose={() => setIsSuggestModalOpen(false)}
          onSave={handleSubmitSuggestion}
          originalText={modalData.original}
          currentTranslation={modalData.current}
        />
      )}

      {/* Support Modal (NEW) */}
      <SupportModal 
        isOpen={isSupportModalOpen} 
        onClose={() => setIsSupportModalOpen(false)} 
      />

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in">
             <div className="p-6">
               <h3 className="text-xl font-bold text-slate-900 mb-1">Admin Login</h3>
               <p className="text-sm text-slate-500 mb-6">Enter your credentials to manage suggestions.</p>
               
               <form onSubmit={handleLogin} className="space-y-4">
                 <div>
                   <input 
                    type="email" 
                    placeholder="Email address"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563eb] outline-none"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                   />
                 </div>
                 <div>
                   <input 
                    type="password" 
                    placeholder="Password"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563eb] outline-none"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                   />
                 </div>
                 
                 {loginError && <p className="text-red-500 text-sm">{loginError}</p>}

                 <div className="flex gap-3 pt-2">
                   <button 
                    type="button" 
                    onClick={() => setShowLogin(false)}
                    className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                    type="submit"
                    className="flex-1 py-3 bg-[#2563eb] text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                   >
                     Login
                   </button>
                 </div>
               </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
