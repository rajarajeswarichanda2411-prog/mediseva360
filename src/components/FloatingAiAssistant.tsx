import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  AlertCircle, 
  RefreshCw, 
  MessageSquare,
  Activity,
  HeartHandshake,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';
import { playNotificationChime } from '../services/notificationService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const FloatingAiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<'te' | 'hi' | 'en' | 'ta'>('te'); // Default to Telugu as per user brief
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-01',
      sender: 'assistant',
      text: 'నమస్కారం! నేను MEDISEVA 360 AI వైద్య సహాయకుడిని. 24/7 భారతదేశంలోని ఆసుపత్రులు, ICU బెడ్లు, లైవ్ OPD టోకెన్ వివరాలు లేదా ప్రభుత్వ ఆరోగ్య పథకాల గురించి ఏదైనా అడగవచ్చు.',
      timestamp: 'Just now',
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleLanguageChange = (lang: 'te' | 'hi' | 'en' | 'ta') => {
    setLanguage(lang);
    let greeting = '';
    if (lang === 'te') {
      greeting = 'నమస్కారం! భాష తెలుగులోకి మార్చబడింది. మీ ఆరోగ్య సంబంధిత ప్రశ్నలను అడగవచ్చు.';
    } else if (lang === 'hi') {
      greeting = 'नमस्ते! भाषा हिंदी में बदल दी गई है। मैं आपकी स्वास्थ्य संबंधी क्या सहायता कर सकता हूँ?';
    } else if (lang === 'ta') {
      greeting = 'வணக்கம்! மொழி தமிழுக்கு மாற்றப்பட்டது. நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?';
    } else {
      greeting = 'Hello! Language set to English. How can I assist your hospital or medical inquiry today?';
    }

    setMessages((prev) => [
      ...prev,
      {
        id: 'msg-' + Date.now(),
        sender: 'assistant',
        text: greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, language }),
      });

      const data = await response.json();
      const botReply =
        data.reply ||
        'ధన్యవాదాలు! పూర్తి వైద్య నిర్ధారణ కోసం మా పోర్టల్‌లో ఆసుపత్రి స్లాట్ బుక్ చేసుకోండి లేదా అత్యవసరమైతే 112 కు కాల్ చేయండి.';

      playNotificationChime();

      setMessages((prev) => [
        ...prev,
        {
          id: 'msg-' + (Date.now() + 1),
          sender: 'assistant',
          text: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.warn('Chat request failed, providing local assistance', err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg-' + (Date.now() + 1),
          sender: 'assistant',
          text: 'MEDISEVA 360 వద్ద అన్ని ప్రభుత్వ మరియు ప్రైవేట్ ఆసుపత్రుల వివరాలు సిద్ధంగా ఉన్నాయి. "Find Hospitals" మ్యాప్ ద్వారా మీ జిల్లాలోని ఆసుపత్రిని ఎంచుకోవచ్చు.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Quick prompt suggestions based on selected language
  const suggestedPrompts =
    language === 'te'
      ? [
          '🏥 సమీపంలో ఉన్న ప్రభుత్వ ఆసుపత్రులు?',
          '🎫 నా లైవ్ OPD టోకెన్ ఎంత సమయం పడుతుంది?',
          '💳 ఆరోగ్యశ్రీ & ఆయుష్మాన్ భారత్ ఉచిత చికిత్స',
          '🩸 అందుబాటులో ఉన్న బ్లడ్ బ్యాంక్ నిల్వలు'
        ]
      : language === 'hi'
      ? [
          '🏥 नजदीकी एम्स व सरकारी अस्पताल',
          '🎫 मेरा ओपीडी टोकन नंबर और वेटिंग टाइम',
          '💳 आयुष्मान भारत कार्ड से मुफ्त इलाज',
          '🚑 आपातकालीन 108 एम्बुलेंस सहायता'
        ]
      : [
          '🏥 Nearest Government Hospitals & ICU Beds',
          '🎫 Live OPD Token Queue & Wait Times',
          '💳 Ayushman Bharat Free Scheme Eligibility',
          '🚑 National Emergency 112 Protocol'
        ];

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Floating Circular Bot Icon with Glowing Ripple */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative p-4 bg-gradient-to-tr from-indigo-700 via-teal-700 to-emerald-600 hover:from-indigo-800 hover:to-emerald-700 text-white rounded-full shadow-2xl transition-all hover:scale-105 flex items-center justify-center focus:outline-hidden ring-4 ring-emerald-500/30 cursor-pointer group"
          title="MEDISEVA 360 AI Medical Assistant"
          aria-label="Open AI Assistant"
        >
          <Bot className="w-6 h-6 group-hover:rotate-6 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full animate-ping"></span>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-slate-900 text-[8px] font-black text-amber-300 rounded uppercase tracking-tighter shadow-xs">
            AI 24/7
          </span>
        </button>
      )}

      {/* Floating Compact Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-teal-900 to-indigo-900 text-white flex items-center justify-between border-b border-teal-800/40">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-900 shadow-sm">
                <Bot className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>MEDISEVA 360 AI</span>
                  <span className="px-1.5 py-0.2 bg-emerald-500/30 text-emerald-300 rounded text-[9px] font-bold border border-emerald-400/30">
                    ONLINE
                  </span>
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-teal-200 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Pan-India Clinical AI & Token Guide</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Language Selector Bar */}
          <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Language:</span>
            <div className="flex gap-1">
              <button
                onClick={() => handleLanguageChange('te')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                  language === 'te'
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                తెలుగు
              </button>
              <button
                onClick={() => handleLanguageChange('hi')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                  language === 'hi'
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                  language === 'en'
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                English
              </button>
              <button
                onClick={() => handleLanguageChange('ta')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                  language === 'ta'
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                தமிழ்
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white rounded-br-xs font-medium'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs whitespace-pre-line'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 px-1 tabular-nums font-mono">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 bg-white border border-slate-200 rounded-2xl w-fit text-slate-500 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[11px] font-semibold text-teal-800 ml-1">
                  MEDISEVA AI is thinking...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Chips */}
          <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[10px]">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-900 border border-slate-200 rounded-lg text-slate-700 font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything about hospitals, OPD token, schemes..."
              className="flex-1 text-xs border border-slate-300 rounded-xl px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="p-2 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white rounded-xl disabled:opacity-40 transition-all cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
