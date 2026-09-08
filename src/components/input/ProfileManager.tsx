import React, { useState, useEffect } from 'react';
import { BirthDetails } from '../../types/astrology';
import { Bookmark, Trash2, Plus, Users, Download, Upload } from 'lucide-react';

interface ProfileManagerProps {
  currentDetails: BirthDetails;
  onSelectProfile: (details: BirthDetails) => void;
}

const STORAGE_KEY = 'jyotish_saved_profiles';

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  currentDetails,
  onSelectProfile
}) => {
  const [profiles, setProfiles] = useState<BirthDetails[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setProfiles(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveProfiles = (list: BirthDetails[]) => {
    setProfiles(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const handleSaveCurrent = () => {
    const id = Date.now().toString();
    const newProfile: BirthDetails = { ...currentDetails, id };
    const updated = [newProfile, ...profiles.filter(p => p.name !== currentDetails.name)];
    saveProfiles(updated);
    alert(`Saved "${currentDetails.name}" to your Kundali library!`);
  };

  const handleDelete = (id?: string) => {
    if (!id) return;
    const updated = profiles.filter(p => p.id !== id);
    saveProfiles(updated);
  };

  const handleExportProfiles = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profiles, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `kundali_profiles_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleSaveCurrent}
          className="btn-outline-gold"
          title="Save current Kundali profile"
          style={{ fontSize: '0.82rem', padding: '6px 12px' }}
        >
          <Bookmark size={14} /> Save Profile
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn-outline-gold"
          style={{ fontSize: '0.82rem', padding: '6px 12px' }}
        >
          <Users size={14} /> Saved ({profiles.length})
        </button>
      </div>

      {isOpen && (
        <div
          className="glass-card-gold"
          style={{
            position: 'absolute',
            top: '110%',
            right: 0,
            width: '320px',
            zIndex: 60,
            padding: '16px',
            boxShadow: '0 12px 35px rgba(0,0,0,0.85)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ color: '#f3e5ab', fontSize: '0.95rem', fontWeight: '700' }}>
              Saved Horoscopes
            </h4>
            {profiles.length > 0 && (
              <button
                onClick={handleExportProfiles}
                className="btn-ghost"
                title="Export all profiles to JSON"
                style={{ fontSize: '0.75rem', padding: '2px 6px' }}
              >
                <Download size={12} /> Backup
              </button>
            )}
          </div>

          {profiles.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', textAlign: 'center', padding: '12px 0' }}>
              No saved profiles yet. Click "Save Profile" to keep horoscopes here.
            </p>
          ) : (
            <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {profiles.map((p) => (
                <div
                  key={p.id || p.name}
                  style={{
                    background: 'rgba(9, 14, 33, 0.8)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div
                    onClick={() => {
                      onSelectProfile(p);
                      setIsOpen(false);
                    }}
                    style={{ cursor: 'pointer', flex: 1 }}
                  >
                    <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#f8fafc' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {p.dob} • {p.cityName}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(p.id)}
                    className="btn-ghost"
                    style={{ padding: '4px', color: '#ef4444' }}
                    title="Delete profile"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
