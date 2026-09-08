import React from 'react';
import { 
  Sparkles, 
  Compass, 
  Grid, 
  Clock, 
  Award, 
  BookOpen, 
  Gem, 
  Heart, 
  Sun, 
  Bot 
} from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  hindiLabel: string;
  icon: React.ReactNode;
}

interface TabsNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TABS: TabItem[] = [
  { id: 'overview', label: 'Overview', hindiLabel: 'सारांश', icon: <Sparkles size={16} /> },
  { id: 'charts', label: 'Kundali Charts', hindiLabel: 'चक्र D1-D12', icon: <Compass size={16} /> },
  { id: 'planets', label: 'Grahas & SAV', hindiLabel: 'ग्रह एवं अष्टकवर्ग', icon: <Grid size={16} /> },
  { id: 'dasha', label: 'Vimshottari Dasha', hindiLabel: 'विंशोत्तरी दशा', icon: <Clock size={16} /> },
  { id: 'yogas', label: 'Yogas & Doshas', hindiLabel: 'योग एवं दोष', icon: <Award size={16} /> },
  { id: 'predictions', label: 'Life Forecasts', hindiLabel: 'फलकथन', icon: <BookOpen size={16} /> },
  { id: 'remedies', label: 'Remedies & Gems', hindiLabel: 'उपाय एवं रत्न', icon: <Gem size={16} /> },
  { id: 'matchmaking', label: 'Kundali Milan', hindiLabel: '36 गुण मिलान', icon: <Heart size={16} /> },
  { id: 'panchang', label: 'Panchang & Gochar', hindiLabel: 'पञ्चाङ्ग व गोचर', icon: <Sun size={16} /> },
  { id: 'ai', label: 'AI Astrologer', hindiLabel: 'ज्योतिष AI', icon: <Bot size={16} /> }
];

export const TabsNav: React.FC<TabsNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <div
      className="no-print"
      style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '6px 0 16px',
        borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
        marginBottom: '24px'
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              border: isActive ? '1.5px solid var(--gold-primary)' : '1px solid rgba(255, 255, 255, 0.08)',
              background: isActive
                ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.22) 0%, rgba(15, 22, 45, 0.85) 100%)'
                : 'rgba(11, 16, 36, 0.65)',
              color: isActive ? '#f5e7a9' : '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              whiteSpace: 'nowrap',
              fontSize: '0.88rem',
              fontWeight: isActive ? '700' : '500',
              boxShadow: isActive ? '0 0 16px rgba(212, 175, 55, 0.25)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <span style={{ color: isActive ? '#d4af37' : '#94a3b8' }}>{tab.icon}</span>
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div>{tab.label}</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.75, fontFamily: 'serif' }}>{tab.hindiLabel}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
