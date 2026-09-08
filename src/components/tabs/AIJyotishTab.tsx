import React, { useState, useRef, useEffect } from 'react';
import { FullKundaliAnalysis } from '../../types/astrology';
import { generateLocalAIResponse, callGeminiAstrologer } from '../../utils/geminiService';
import { Sparkles, Send, Key, Bot, User, RefreshCw } from 'lucide-react';

interface AIJyotishTabProps {
  data: FullKundaliAnalysis;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const SUGGESTED_PROMPTS = [
  'What career & business path is best suited for my 10th house?',
  'Analyze my 7th house and marriage prospects',
  'What are the effects of my running Vimshottari Dasha?',
  'Which gemstone should I wear and what is the wearing method?',
  'Are there strong Raj Yogas or Dhana Yogas in my Kundali?',
  'Explain my Manglik and Sade Sati status'
];

export const AIJyotishTab: React.FC<AIJyotishTabProps> = ({ data }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: `Namaste **${data.birthDetails.name}**! 🙏\n\nI am your AI Vedic Astrologer. I have analyzed your Sidereal birth chart (Lagna: **${data.ascendant.rashi}**, Moon: **${data.planets.find(p => p.name === 'Moon')?.rashi}**, Running Dasha: **${data.dasha.currentMahadasha?.planet}**).\n\nYou can ask me any specific question about your career, marriage, wealth, dasha shifts, or gemstones.`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('jyotish_gemini_api_key') || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('jyotish_gemini_api_key', key);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', text }];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      if (apiKey.trim()) {
        const historyForApi = messages.slice(1).map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));
        const response = await callGeminiAstrologer(apiKey.trim(), text, data, historyForApi);
        setMessages([...newMessages, { role: 'model', text: response }]);
      } else {
        // Built-in intelligent Vedic synthesis
        await new Promise(r => setTimeout(r, 600)); // smooth simulated thinking
        const localResponse = generateLocalAIResponse(text, data);
        setMessages([...newMessages, { role: 'model', text: localResponse }]);
      }
    } catch (err: any) {
      console.error(err);
      const fallback = generateLocalAIResponse(text, data);
      setMessages([
        ...newMessages,
        {
          role: 'model',
          text: `⚠️ *(Notice: API call encountered an error. Falling back to built-in Vedic inference)*\n\n${fallback}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & API Key Toggle */}
      <div className="glass-card-gold" style={{ padding: '20px 24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div>
          <h2 className="text-gold-gradient" style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bot size={22} color="#d4af37" /> AI Vedic Astrologer ("Jyotish Acharya")
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
            Instant conversational interpretation synthesized from your exact planetary coordinates
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="btn-outline-gold"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <Key size={14} /> {apiKey ? 'Gemini Key Configured ✓' : 'Add Gemini API Key (Optional)'}
          </button>
        </div>
      </div>

      {/* API Key Modal / Drawer */}
      {showApiKeyInput && (
        <div className="glass-card" style={{ padding: '16px 20px', background: 'rgba(9, 14, 33, 0.9)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#f3e5ab' }}>
              Google Gemini API Key (Optional Enhancement)
            </span>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              The app works 100% offline out-of-the-box without an API key!
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="password"
              className="input-cosmic"
              placeholder="Paste AI Studio Gemini API Key (e.g. AIzaSy...)"
              value={apiKey}
              onChange={(e) => handleSaveApiKey(e.target.value)}
            />
            {apiKey && (
              <button
                onClick={() => handleSaveApiKey('')}
                className="btn-ghost"
                style={{ fontSize: '0.8rem', color: '#ef4444' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Suggestion Prompt Chips */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="btn-outline-gold"
            style={{ fontSize: '0.78rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
          >
            <Sparkles size={12} /> {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div
        className="glass-card"
        style={{
          padding: '24px',
          minHeight: '440px',
          maxHeight: '560px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%'
            }}
          >
            {m.role === 'model' && (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f5e7a9 0%, #d4af37 100%)',
                  color: '#070913',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}
              >
                <Bot size={18} />
              </div>
            )}

            <div
              style={{
                background: m.role === 'user' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(9, 14, 33, 0.85)',
                border: m.role === 'user' ? '1px solid var(--gold-primary)' : '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '16px',
                padding: '16px 20px',
                fontSize: '0.92rem',
                lineHeight: '1.7',
                color: '#f8fafc',
                whiteSpace: 'pre-line'
              }}
            >
              {m.text}
            </div>

            {m.role === 'user' && (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#3b82f6',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}
              >
                <User size={18} />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#d4af37', fontSize: '0.88rem' }}>
            <RefreshCw className="animate-spin-slow" size={18} />
            <em>Consulting celestial ephemeris and synthesising astrological insight...</em>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          className="input-cosmic"
          style={{ padding: '14px 18px', fontSize: '0.96rem' }}
          placeholder="Ask a question about your horoscope (e.g. When is the best time for job change?)..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputText.trim()}
          className="btn-gold"
          style={{ padding: '0 24px' }}
        >
          <Send size={18} /> Send
        </button>
      </div>
    </div>
  );
};
