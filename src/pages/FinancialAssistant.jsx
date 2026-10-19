import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { FiSend, FiMessageSquare, FiTrendingDown, FiShield, FiTrendingUp } from 'react-icons/fi';

const FinancialAssistant = () => {
  const [message, setMessage] = useState('');
  const [chatList, setChatList] = useState([
    {
      role: 'assistant',
      text: "Hello! I am your FinGuard AI Assistant. Ask me about creating budgets, saving strategies, or analyzing suspicious billing messages.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to bottom of chat list
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatList, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMsg = message.trim();
    setMessage('');
    setChatList((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Build context history from existing list
      const history = chatList.map((c) => ({
        role: c.role,
        text: c.text,
      }));

      const res = await api.post('/ai/chat', { message: userMsg, history });
      setChatList((prev) => [...prev, { role: 'assistant', text: res.data.reply }]);
    } catch (err) {
      setChatList((prev) => [
        ...prev,
        { role: 'assistant', text: 'Sorry, I encountered an issue checking my ledger. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setMessage(question);
  };

  const quickReplies = [
    { text: 'How can I start a monthly budget?', icon: FiTrendingDown },
    { text: 'Explain how to detect WhatsApp phishing scams.', icon: FiShield },
    { text: 'What is a good strategy to save money?', icon: FiTrendingUp },
  ];

  return (
    <div className="h-[calc(100vh-130px)] flex flex-col justify-between gap-6 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
          <FiMessageSquare className="text-indigo-400 shrink-0" />
          <span>AI Financial Assistant</span>
        </h1>
        <p className="text-slate-400 mt-1">Converse with Gemini to structure budgets and trace scams.</p>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 glass border border-slate-800 rounded-2xl p-6 flex flex-col justify-between overflow-hidden bg-slate-950/20 relative">
        <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-[80px] pointer-events-none"></div>

        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4 scrollbar-thin">
          {chatList.map((chat, idx) => (
            <div
              key={idx}
              className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl border text-sm leading-relaxed ${
                  chat.role === 'user'
                    ? 'bg-indigo-600 border-indigo-500 text-white rounded-br-none shadow-md shadow-indigo-600/10'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 rounded-bl-none'
                }`}
              >
                {chat.text}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-900/80 border border-slate-800 text-slate-400 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick Question Prompts */}
        {chatList.length === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {quickReplies.map((qr) => (
              <button
                key={qr.text}
                onClick={() => handleQuickQuestion(qr.text)}
                className="p-3 text-left rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 hover:border-indigo-500/30 transition-all flex items-center gap-2"
              >
                <qr.icon className="text-indigo-400 shrink-0" />
                <span>{qr.text}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input Form Box */}
        <form onSubmit={handleSend} className="flex gap-3 border-t border-slate-800 pt-4 mt-2">
          <input
            type="text"
            placeholder="Type your financial planning or security questions here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 outline-none text-slate-200 text-sm focus:border-indigo-500 focus:bg-slate-950 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all disabled:opacity-30 shadow-lg shadow-indigo-600/15"
          >
            <FiSend size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default FinancialAssistant;
