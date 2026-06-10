'use client';

import { Sparkles, MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store'; 

export function AiInsightsCard() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [insight, setInsight] = useState("Analyzing your leave patterns...");
  const [loading, setLoading] = useState(true);
  
  // Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial Insight Fetch
  useEffect(() => {
    const fetchInsight = async () => {
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/api/employee/insights', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setInsight(data.suggestion);
        // Add the initial insight as the first AI message in the chat!
        setMessages([{ role: 'model', text: data.suggestion }]);
      } catch (error) {
        setInsight("Take a deep breath and have a great day at work!");
      } finally {
        setLoading(false);
      }
    };
    fetchInsight();
  }, [token]);

  // Handle sending a chat message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !token) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    
    // Add user message to UI immediately
    const newMessages = [...messages, { role: 'user', text: userMsg }];
    setMessages(newMessages);
    setIsReplying(true);

    try {
      // Format history for Gemini API (it expects 'user' and 'model' roles)
      const apiHistory = messages.map(msg => ({
        role: msg.role === 'ai' ? 'model' : msg.role,
        parts: [{ text: msg.text }]
      }));

      const res = await fetch('http://localhost:5000/api/employee/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ message: userMsg, history: apiHistory })
      });

      const data = await res.json();
      setMessages([...newMessages, { role: 'model', text: data.reply }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'model', text: "Sorry, I lost my connection!" }]);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] text-white shadow-xl shadow-indigo-200 relative overflow-hidden flex flex-col transition-all duration-500">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl pointer-events-none"></div>
      
      {/* Top Section (The Original Card) */}
      <div className="p-8 relative z-10">
        <div className="flex items-center gap-3 mb-4 opacity-90">
          <Sparkles className={`w-6 h-6 ${loading ? 'animate-pulse text-indigo-200' : 'text-yellow-300'}`} />
          <h3 className="font-black text-sm tracking-[0.2em] uppercase">Smart Suggestion</h3>
        </div>
        
        <p className={`font-medium text-lg leading-relaxed transition-opacity duration-500 ${loading ? 'opacity-70 animate-pulse' : 'opacity-100'}`}>
          {insight}
        </p>

        {/* The Button you circled! */}
        {!isChatOpen && (
          <div className="flex justify-end mt-4">
            <button 
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold transition-all"
            >
              <MessageCircle className="w-4 h-4" /> Ask HR Assistant
            </button>
          </div>
        )}
      </div>

      {/* Expandable Chat Section */}
      <div className={`bg-white text-gray-800 transition-all duration-500 ease-in-out flex flex-col ${isChatOpen ? 'h-80 opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}>
        
        {/* Chat Header */}
        <div className="flex justify-between items-center px-6 py-3 border-b border-gray-100 bg-gray-50">
          <span className="font-bold text-sm text-indigo-600">HR Assistant</span>
          <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isReplying && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-400 rounded-2xl rounded-bl-none px-4 py-2 text-sm animate-pulse">
                Typing...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
          <input 
            type="text" 
            placeholder="Ask about your leaves, holidays..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <button 
            type="submit" 
            disabled={!chatInput.trim() || isReplying}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white p-2 rounded-xl transition-colors flex items-center justify-center w-10 h-10"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}