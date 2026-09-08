import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { KundaliChart, BirthData } from './core/models';
import { calculateKundali } from './core/calculator';
import BirthForm from './components/BirthForm';
import ThemeToggle from './components/ThemeToggle';
import LanguageToggle from './components/LanguageToggle';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import {
  loadProfiles, createProfile, updateProfile, deleteProfile,
  getLastProfileId, setLastProfileId, clearLastProfileId,
  type Profile,
} from './utils/profiles';

// Tabs
import Overview       from './components/dashboard/Overview';
import PlanetEffects  from './components/dashboard/PlanetEffects';
import YogaList       from './components/dashboard/YogaList';
import CurrentSky     from './components/dashboard/CurrentSky';
import KundaliCharts  from './components/charts/KundaliCharts';
import AspectMatrix   from './components/dashboard/AspectMatrix';
import HouseGrid      from './components/dashboard/HouseGrid';
import DashaTimeline  from './components/dashboard/DashaTimeline';
import DoshaPanel     from './components/dashboard/DoshaPanel';
import Panchang       from './components/dashboard/Panchang';
import PlanetTable    from './components/dashboard/PlanetTable';
import DivisionalCharts from './components/charts/DivisionalCharts';

// ─── Tab config ───────────────────────────────────────────────────────────────

type Tab =
  | 'overview' | 'effects' | 'yogas' | 'sky' | 'chart' | 'varga' | 'drishti'
  | 'houses' | 'dasha' | 'doshas' | 'panchang' | 'planets' | 'profiles';

// ─── Profile Manager UI ───────────────────────────────────────────────────────

interface ProfileManagerProps {
  profiles: Profile[];
  activeId: string | null;
  onSelect: (p: Profile) => void;
  onCreate: (name: string, birth: BirthData) => void;
  onEdit:   (id: string, name: string, birth: BirthData) => void;
  onDelete: (id: string) => void;
  onClose:  () => void;
}

function ProfileManager({ profiles, activeId, onSelect, onCreate, onEdit, onDelete, onClose }: ProfileManagerProps) {
  const { t } = useLanguage();
  const [showForm, setShowForm]   = useState(profiles.length === 0);
  const [editing, setEditing]     = useState<Profile | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [newName, setNewName]     = useState('');

  function formatDate(iso: string) {
    try {
      const d = new Date(iso + 'T00:00:00');
      return d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
    } catch { return iso; }
  }

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:500,
      background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center',
      padding:'1rem',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background:'var(--surface-raised)', borderRadius:'var(--radius-lg)',
        width:'100%', maxWidth:500, maxHeight:'90vh', overflow:'auto',
        boxShadow:'var(--shadow-lg)',
      }}>
        {/* Header */}
        <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--border-subtle)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontWeight:700, fontSize:'1rem', color:'var(--text-primary)' }}>{t('profile.title')}</div>
          <button className="btn btn-ghost" style={{ padding:'0.2rem 0.6rem' }} onClick={onClose}>✕</button>
        </div>

        <div style={{ padding:'1rem 1.25rem' }}>
          {/* Profile cards */}
          {profiles.length > 0 ? (
            <div style={{ marginBottom:'1rem' }}>
              {profiles.map(p => (
                <div key={p.id} style={{
                  padding:'0.75rem 0.9rem', borderRadius:'var(--radius-sm)',
                  background: p.id === activeId ? 'var(--brand-glow)' : 'var(--surface-overlay)',
                  border:`1.5px solid ${p.id === activeId ? 'var(--brand-400)' : 'var(--border-subtle)'}`,
                  marginBottom:'0.5rem',
                }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'0.5rem' }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, color: p.id === activeId ? 'var(--brand-400)' : 'var(--text-primary)', fontSize:'0.9rem' }}>
                        {p.id === activeId && '✓ '}{p.name}
                      </div>
                      <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'0.15rem' }}>
                        {formatDate(p.birth.dob)} · {p.birth.tob} · {p.birth.cityName}{p.birth.country ? `, ${p.birth.country}` : ''}
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:'0.35rem', flexShrink:0 }}>
                      <button className="btn btn-secondary" style={{ fontSize:'0.75rem', padding:'0.25rem 0.7rem' }}
                        onClick={() => { onSelect(p); onClose(); }}>{t('profile.open')}</button>
                      <button className="btn btn-ghost" style={{ fontSize:'0.75rem', padding:'0.25rem 0.6rem' }}
                        onClick={() => { setEditing(p); setNewName(p.name); setShowForm(true); }}>✏</button>
                      {confirmId === p.id ? (
                        <>
                          <button className="btn" style={{ fontSize:'0.72rem', padding:'0.25rem 0.6rem', background:'var(--danger-fg)', color:'#fff', border:'none', borderRadius:'var(--radius-xs)', cursor:'pointer' }}
                            onClick={() => { onDelete(p.id); setConfirmId(null); }}>{t('profile.confirm')}</button>
                          <button className="btn btn-ghost" style={{ fontSize:'0.72rem', padding:'0.25rem 0.5rem' }}
                            onClick={() => setConfirmId(null)}>{t('profile.cancel')}</button>
                        </>
                      ) : (
                        <button className="btn btn-ghost" style={{ fontSize:'0.75rem', padding:'0.25rem 0.6rem', color:'var(--danger-fg)' }}
                          onClick={() => setConfirmId(p.id)}>🗑</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize:'0.84rem', color:'var(--text-muted)', marginBottom:'1rem' }}>
              {t('profile.empty')}
            </div>
          )}

          {/* Create new profile button */}
          {!showForm && (
            <button className="btn btn-secondary" style={{ width:'100%' }}
              onClick={() => { setEditing(null); setNewName(''); setShowForm(true); }}>
              {t('profile.new')}
            </button>
          )}

          {/* Inline birth form for create/edit */}
          {showForm && (
            <div style={{ borderTop: profiles.length > 0 ? '1px solid var(--border-subtle)' : 'none', paddingTop: profiles.length > 0 ? '1rem' : 0 }}>
              <div style={{ fontWeight:600, fontSize:'0.88rem', color:'var(--text-primary)', marginBottom:'0.75rem' }}>
                {editing ? `${t('profile.edit')} — ${editing.name}` : t('profile.new')}
              </div>
              {/* Profile name field */}
              <div className="form-group" style={{ marginBottom:'0.75rem' }}>
                <label className="form-label">{t('profile.name')}</label>
                <input className="form-input" value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. My Chart, Mum, Ravi…" />
              </div>
              {/* Reuse existing BirthForm but in "profile save" mode */}
              <BirthForm
                key={editing?.id ?? 'new'}
                initialData={editing?.birth}
                onCalculate={(birth) => {
                  const name = newName.trim() || birth.name || 'Profile';
                  if (editing) {
                    onEdit(editing.id, name, birth);
                  } else {
                    onCreate(name, birth);
                  }
                  setShowForm(false);
                  setEditing(null);
                }}
                isLoading={false}
                submitLabel={editing ? t('profile.update') : t('profile.save')}
                hideTitle
              />
              <button className="btn btn-ghost" style={{ marginTop:'0.5rem', width:'100%' }}
                onClick={() => { setShowForm(false); setEditing(null); }}>{t('profile.cancel')}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Profiles Workspace (Full-page Desktop View) ──────────────────────────────

function ProfilesWorkspace({
  profiles,
  activeId,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
}: {
  profiles: Profile[];
  activeId: string | null;
  onSelect: (p: Profile) => void;
  onCreate: (name: string, birth: BirthData) => void;
  onEdit:   (id: string, name: string, birth: BirthData) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useLanguage();
  const [showForm, setShowForm]   = useState(profiles.length === 0);
  const [editing, setEditing]     = useState<Profile | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [newName, setNewName]     = useState('');

  function formatDate(iso: string) {
    try {
      const d = new Date(iso + 'T00:00:00');
      return d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
    } catch { return iso; }
  }

  return (
    <div className="fade-in">
      {/* Header Banner */}
      <div className="card card-gold" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.4rem' }}>👤</span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {t('header.profiles')} — Kundali Library
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
            Manage saved birth charts, switch active horoscope, or onboard a new profile.
          </p>
        </div>
        {!showForm && (
          <button
            className="btn btn-primary"
            onClick={() => { setEditing(null); setNewName(''); setShowForm(true); }}
            style={{ fontSize: '0.88rem' }}
          >
            + {t('profile.new')}
          </button>
        )}
      </div>

      {/* Inline Onboarding / Edit Mode */}
      {showForm && (
        <div className="card card-hero fade-in" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--brand-400)', fontWeight: 700 }}>
                {editing ? 'Update Profile' : 'New Horoscope Onboarding'}
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.15rem 0 0', color: 'var(--text-primary)' }}>
                {editing ? `${t('profile.edit')} — ${editing.name}` : t('profile.new')}
              </h3>
            </div>
            <button className="btn btn-ghost" onClick={() => { setShowForm(false); setEditing(null); }}>✕ {t('profile.cancel')}</button>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">{t('profile.name')}</label>
            <input
              className="form-control"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. My Chart, Mother, Ravi…"
            />
          </div>

          <BirthForm
            key={editing?.id ?? 'new-profile'}
            initialData={editing?.birth}
            onCalculate={(birth) => {
              const name = newName.trim() || birth.name || 'Profile';
              if (editing) {
                onEdit(editing.id, name, birth);
              } else {
                onCreate(name, birth);
              }
              setShowForm(false);
              setEditing(null);
            }}
            isLoading={false}
            submitLabel={editing ? t('profile.update') : t('profile.save')}
            hideTitle
          />
        </div>
      )}

      {/* Profiles Grid */}
      {profiles.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}>
          {profiles.map(p => {
            const isActive = p.id === activeId;
            return (
              <div
                key={p.id}
                className="card card-interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isActive ? '1.5px solid var(--border-gold)' : undefined,
                  background: isActive ? 'linear-gradient(180deg, var(--brand-glow) 0%, var(--surface-raised) 100%)' : undefined,
                }}
              >
                <div>
                  {/* Card Top */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: 'var(--brand-glow)', border: '1.5px solid var(--border-gold)',
                        display: 'grid', placeItems: 'center', fontSize: '1.1rem', color: 'var(--brand-400)',
                        fontWeight: 700,
                      }}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {p.birth.gender ? `${p.birth.gender.charAt(0).toUpperCase() + p.birth.gender.slice(1)} · ` : ''}ID: {p.id.slice(0, 6)}
                        </div>
                      </div>
                    </div>
                    {isActive && (
                      <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                        ✓ Active
                      </span>
                    )}
                  </div>

                  {/* Profile Details List */}
                  <div style={{ background: 'var(--surface-overlay)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div className="info-row">
                      <span className="label">📅 {t('form.dob')}</span>
                      <span className="value">{formatDate(p.birth.dob)}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">⏰ {t('form.tob')}</span>
                      <span className="value">{p.birth.tob}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">📍 {t('form.birthPlace')}</span>
                      <span className="value" style={{ maxWidth: 160, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {[p.birth.cityName, p.birth.state, p.birth.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">🌐 Coordinates</span>
                      <span className="value" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                        {p.birth.latitude.toFixed(2)}°, {p.birth.longitude.toFixed(2)}°
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '0.5rem', marginTop: '1rem', paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-subtle)',
                }}>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
                    onClick={() => onSelect(p)}
                  >
                    🔮 {t('profile.open')}
                  </button>

                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
                    onClick={() => { setEditing(p); setNewName(p.name); setShowForm(true); }}
                    title={t('profile.edit')}
                  >
                    ✏
                  </button>

                  {confirmId === p.id ? (
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        className="btn"
                        style={{ fontSize: '0.75rem', padding: '0.45rem 0.55rem', background: 'var(--danger-fg)', color: '#fff', border: 'none', borderRadius: 'var(--radius-xs)', cursor: 'pointer' }}
                        onClick={() => { onDelete(p.id); setConfirmId(null); }}
                      >
                        {t('profile.confirm')}
                      </button>
                      <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '0.45rem 0.45rem' }} onClick={() => setConfirmId(null)}>
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem', color: 'var(--danger-fg)' }}
                      onClick={() => setConfirmId(p.id)}
                      title="Delete profile"
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        !showForm && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👤</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.4rem' }}>
              {t('profile.empty')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 420, marginInline: 'auto', marginBottom: '1.25rem' }}>
              Create a profile to save personal details and quickly explore birth charts anytime.
            </p>
            <button className="btn btn-primary" onClick={() => { setEditing(null); setNewName(''); setShowForm(true); }}>
              + {t('profile.new')}
            </button>
          </div>
        )
      )}
    </div>
  );
}

// ─── Save prompt (appears after first calculation when no profile saved) ──────

function SavePrompt({ birth, onSave, onDismiss }: { birth: BirthData; onSave: (name: string) => void; onDismiss: () => void }) {
  const { t } = useLanguage();
  const [name, setName] = useState(birth.name || '');
  return (
    <div style={{
      background:'var(--surface-raised)', border:'1px solid var(--brand-400)',
      borderRadius:'var(--radius-md)', padding:'0.9rem 1.1rem',
      marginBottom:'1rem', display:'flex', gap:'0.75rem', alignItems:'center', flexWrap:'wrap',
    }}>
      <div style={{ flex:1, minWidth:180 }}>
        <div style={{ fontWeight:600, fontSize:'0.88rem', color:'var(--brand-400)', marginBottom:'0.35rem' }}>
          💾 {t('form.saveProfilePrompt')}
        </div>
        <input className="form-input" style={{ fontSize:'0.82rem', padding:'0.35rem 0.65rem' }}
          value={name} onChange={e => setName(e.target.value)} placeholder="Profile name…" />
      </div>
      <div style={{ display:'flex', gap:'0.4rem' }}>
        <button className="btn btn-secondary" style={{ fontSize:'0.82rem' }}
          onClick={() => onSave(name.trim() || birth.name || 'My Chart')}>{t('form.saveProfileBtn')}</button>
        <button className="btn btn-ghost" style={{ fontSize:'0.82rem' }} onClick={onDismiss}>{t('form.dismiss')}</button>
      </div>
    </div>
  );
}

// ─── AppContent ────────────────────────────────────────────────────────────────

function AppContent() {
  const { t } = useLanguage();

  // Profile state
  const [profiles,   setProfiles]   = useState<Profile[]>(() => loadProfiles());
  const [activeProf, setActiveProf] = useState<Profile | null>(null);
  const [showMgr,    setShowMgr]    = useState(false);
  const [showSave,   setShowSave]   = useState(false);
  const pendingBirth = useRef<BirthData | null>(null);

  // Chart state
  const [chart,     setChart]     = useState<KundaliChart | null>(null);
  const [tab,       setTab]       = useState<Tab>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [showForm,  setShowForm]  = useState(true);

  // Theme
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('jv-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('jv-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Auto-load last profile on mount
  useEffect(() => {
    const profs = loadProfiles();
    if (profs.length === 0) return;
    const lastId = getLastProfileId();
    const last   = lastId ? profs.find(p => p.id === lastId) : null;
    const target = last ?? profs[0];
    openProfile(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openProfile(p: Profile) {
    setActiveProf(p);
    setLastProfileId(p.id);
    pendingBirth.current = null;
    setShowSave(false);
    setShowForm(false);
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      try {
        const c = calculateKundali(p.birth);
        setChart(c);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Calculation error');
      } finally {
        setIsLoading(false);
      }
    }, 50);
  }

  const handleCalculate = useCallback((birth: BirthData) => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        const c = calculateKundali(birth);
        setChart(c);
        setShowForm(false);
        const hasSaved = profiles.some(p =>
          p.birth.dob === birth.dob &&
          p.birth.tob === birth.tob &&
          p.birth.latitude === birth.latitude &&
          p.birth.longitude === birth.longitude
        );
        if (!hasSaved && !activeProf) {
          pendingBirth.current = birth;
          setShowSave(true);
        } else {
          setShowSave(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to calculate chart');
      } finally {
        setIsLoading(false);
      }
    }, 50);
  }, [profiles, activeProf]);

  function handleSavePrompt(name: string) {
    if (!pendingBirth.current) return;
    const p = createProfile(name, pendingBirth.current);
    setProfiles(loadProfiles());
    setActiveProf(p);
    setLastProfileId(p.id);
    pendingBirth.current = null;
    setShowSave(false);
  }

  function handleCreate(name: string, birth: BirthData) {
    const p = createProfile(name, birth);
    setProfiles(loadProfiles());
    openProfile(p);
  }

  function handleEdit(id: string, name: string, birth: BirthData) {
    updateProfile(id, name, birth);
    const updated = loadProfiles();
    setProfiles(updated);
    if (activeProf?.id === id) {
      const p = updated.find(x => x.id === id);
      if (p) openProfile(p);
    }
  }

  function handleDelete(id: string) {
    deleteProfile(id);
    const updated = loadProfiles();
    setProfiles(updated);
    if (activeProf?.id === id) {
      clearLastProfileId();
      if (updated.length > 0) openProfile(updated[0]);
      else {
        setActiveProf(null);
        setChart(null);
        setShowForm(true);
      }
    }
  }

  // ─── Dynamic localized tab definitions ──────────────────────────────────────

  // ─── Dynamic localized tab definitions ──────────────────────────────────────

  const primaryTabs = [
    { id: 'overview' as Tab, label: t('nav.overview'), icon: '🌟' },
    { id: 'chart'    as Tab, label: t('nav.birthChart'), icon: '🔷' },
    { id: 'effects'  as Tab, label: t('nav.planetEffects'), icon: '🪐' },
    { id: 'yogas'    as Tab, label: t('nav.rajYogas'), icon: '✨' },
    { id: 'sky'      as Tab, label: t('nav.currentSky'), icon: '🌍' },
    { id: 'varga'    as Tab, label: t('nav.varga'), icon: '🔢' },
    { id: 'drishti'  as Tab, label: t('nav.drishti'), icon: '👁' },
  ];

  const secondaryTabs = [
    { id: 'houses'   as Tab, label: t('nav.houses'), icon: '🏠' },
    { id: 'dasha'    as Tab, label: t('nav.dasha'), icon: '🕐' },
    { id: 'doshas'   as Tab, label: t('nav.doshas'), icon: '⚠️' },
    { id: 'planets'  as Tab, label: t('nav.planets'), icon: '📊' },
    { id: 'panchang' as Tab, label: t('nav.panchang'), icon: '🪔' },
  ];

  const allTabs = [...primaryTabs, ...secondaryTabs];
  const activeTabMeta = allTabs.find(tItem => tItem.id === tab);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function goTab(tItem: Tab) {
    setTab(tItem);
    setShowForm(false);
    setSidebarOpen(false);
  }

  return (
    <div className="app-shell">
      {/* Profile manager overlay */}
      {showMgr && (
        <ProfileManager
          profiles={profiles}
          activeId={activeProf?.id ?? null}
          onSelect={(p) => { openProfile(p); setSidebarOpen(false); }}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClose={() => setShowMgr(false)}
        />
      )}

      {/* Mobile drawer backdrop */}
      <div
        className={`drawer-backdrop ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* ─── DESKTOP & MOBILE SIDEBAR ────────────────────────────────────── */}
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🔮</div>
          <div className="sidebar-brand-text">
            <h1>{t('header.title')}</h1>
            <p>{t('header.subtitle')}</p>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="sidebar-nav" aria-label="Main Navigation">
          <div className="sidebar-nav-heading">Celestial Intelligence</div>
          {primaryTabs.map(tItem => {
            const isActive = tab === tItem.id && !showForm;
            return (
              <button
                key={tItem.id}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                onClick={() => goTab(tItem.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="sidebar-item-icon" aria-hidden="true">{tItem.icon}</span>
                <span>{tItem.label}</span>
              </button>
            );
          })}

          <div className="sidebar-nav-heading" style={{ marginTop: '0.4rem' }}>Deep Explorations</div>
          {secondaryTabs.map(tItem => {
            const isActive = tab === tItem.id && !showForm;
            return (
              <button
                key={tItem.id}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                onClick={() => goTab(tItem.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="sidebar-item-icon" aria-hidden="true">{tItem.icon}</span>
                <span>{tItem.label}</span>
              </button>
            );
          })}

          <div className="sidebar-nav-heading" style={{ marginTop: '0.4rem' }}>Library</div>
          <button
            className={`sidebar-item ${tab === 'profiles' && !showForm ? 'active' : ''}`}
            onClick={() => goTab('profiles')}
            aria-current={tab === 'profiles' && !showForm ? 'page' : undefined}
          >
            <span className="sidebar-item-icon" aria-hidden="true">👤</span>
            <span>{t('header.profiles')} {profiles.length > 0 ? `(${profiles.length})` : ''}</span>
          </button>
        </nav>

        {/* Sidebar Active Profile Widget */}
        <div style={{ padding: '0.75rem 0.9rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-raised)' }}>
          {activeProf ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)',
              background: 'var(--brand-glow)', border: '1px solid var(--border-brand)',
            }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Kundali</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {activeProf.name}
                </div>
              </div>
              <button
                className="btn btn-ghost"
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', flexShrink: 0 }}
                onClick={() => setShowMgr(true)}
                title={t('header.manageProfiles')}
              >
                Switch
              </button>
            </div>
          ) : (
            <button
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '0.8rem', justifyContent: 'center' }}
              onClick={() => setShowMgr(true)}
            >
              👤 {t('header.profiles')} ({profiles.length})
            </button>
          )}
        </div>

        {/* Sidebar Footer Controls */}
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <LanguageToggle />
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark(d => !d)} />
          </div>
        </div>
      </aside>

      {/* ─── MAIN VIEWPORT ──────────────────────────────────────────────── */}
      <div className="app-viewport">
        {/* Top bar */}
        <header className="app-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Mobile Hamburger Toggle */}
            <button
              className="btn btn-ghost"
              style={{ padding: '0.35rem 0.6rem', fontSize: '1.2rem', display: 'none' }}
              id="mobile-drawer-btn"
              onClick={() => setSidebarOpen(o => !o)}
              aria-label="Toggle navigation menu"
            >
              ☰
            </button>

            {/* Current View Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>{showForm ? '📝' : activeTabMeta?.icon}</span>
              <span style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
                {showForm ? (activeProf ? `${t('header.edit')} — ${activeProf.name}` : t('profile.new')) : activeTabMeta?.label}
              </span>
            </div>
          </div>

          {/* Top Bar Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {/* Profile Quick Pill */}
            {activeProf && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  className="btn btn-ghost"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                  onClick={() => setShowForm(f => !f)}
                  title={showForm ? t('header.chart') : t('header.edit')}
                >
                  {showForm ? `📊 ${t('header.chart')}` : `✏ ${t('header.edit')}`}
                </button>
              </div>
            )}

            {!activeProf && chart && (
              <button
                className="btn btn-ghost"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                onClick={() => setShowForm(f => !f)}
              >
                {showForm ? `📊 ${t('header.chart')}` : `✏ ${t('header.edit')}`}
              </button>
            )}

            {/* Profiles Manager Button */}
            <button
              className="btn btn-secondary"
              style={{ position: 'relative', fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}
              onClick={() => goTab('profiles')}
              title={t('header.manageProfiles')}
            >
              👤 {t('header.profiles')}
              {profiles.length > 0 && (
                <span style={{
                  background: 'var(--brand-400)', color: '#000',
                  borderRadius: '50%', width: 16, height: 16,
                  fontSize: '0.6rem', fontWeight: 700, display: 'inline-grid', placeItems: 'center',
                  marginLeft: '0.2rem',
                }}>{profiles.length}</span>
              )}
            </button>
          </div>
        </header>

        {/* Main Canvas Area */}
        <main className="app-main-canvas">
          {/* Save prompt if pending profile */}
          {showSave && pendingBirth.current && (
            <SavePrompt
              birth={pendingBirth.current}
              onSave={handleSavePrompt}
              onDismiss={() => setShowSave(false)}
            />
          )}

          {/* Profiles Library Workspace */}
          {tab === 'profiles' && !showForm && (
            <ProfilesWorkspace
              profiles={profiles}
              activeId={activeProf?.id ?? null}
              onSelect={(p) => { openProfile(p); goTab('overview'); }}
              onCreate={handleCreate}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}

          {/* Birth Details Form Mode */}
          {showForm && (
            <div style={{ maxWidth: 840, margin: '0 auto' }}>
              {error && (
                <div style={{
                  background: 'var(--danger-bg)', border: '1px solid var(--danger-fg)',
                  borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem',
                  marginBottom: '1rem', color: 'var(--danger-fg)', fontSize: '0.82rem',
                }}>⚠ {error}</div>
              )}
              {profiles.length === 0 && !showSave && (
                <div style={{
                  padding: '0.85rem 1.15rem', borderRadius: 'var(--radius-md)',
                  background: 'var(--brand-glow)', border: '1px solid var(--border-brand)',
                  fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1.25rem',
                }}>
                  {t('form.tip')}
                </div>
              )}
              <BirthForm onCalculate={handleCalculate} isLoading={isLoading} />
            </div>
          )}

          {/* Chart Presentation Mode */}
          {chart && !showForm && tab !== 'profiles' && (
            <>
              {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                  <div className="spinner" />
                </div>
              ) : (
                <div className="fade-in">
                  {tab === 'overview'  && <Overview chart={chart} onNavigate={(tItem) => goTab(tItem as Tab)} />}
                  {tab === 'chart'     && <KundaliCharts chart={chart} />}
                  {tab === 'effects'   && <PlanetEffects chart={chart} />}
                  {tab === 'yogas'     && <YogaList chart={chart} />}
                  {tab === 'sky'       && <CurrentSky chart={chart} />}
                  {tab === 'varga'     && <DivisionalCharts chart={chart} />}
                  {tab === 'drishti'   && <AspectMatrix chart={chart} />}
                  {tab === 'houses'    && <HouseGrid chart={chart} />}
                  {tab === 'dasha'     && <DashaTimeline chart={chart} />}
                  {tab === 'doshas'    && <DoshaPanel chart={chart} />}
                  {tab === 'planets'   && <PlanetTable chart={chart} onSelectPlanet={() => {}} />}
                  {tab === 'panchang'  && <Panchang chart={chart} />}
                </div>
              )}
            </>
          )}

          {/* Empty state — no chart, no form, not on profiles */}
          {!chart && !showForm && tab !== 'profiles' && (
            <div className="empty-state">
              <div className="empty-icon">🔮</div>
              <h3>{t('common.emptyTitle')}</h3>
              <p>{t('common.emptyDesc')}</p>
              <button className="btn btn-primary mt-3" onClick={() => setShowForm(true)}>
                {t('profile.new')}
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ─── MOBILE BOTTOM NAV ────────────────────────────────────────────── */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        <button
          className={`mobile-nav-btn ${tab === 'overview' && !showForm ? 'active' : ''}`}
          onClick={() => goTab('overview')}
        >
          <span>🌟</span>
          <span>{t('nav.overview')}</span>
        </button>
        <button
          className={`mobile-nav-btn ${tab === 'chart' && !showForm ? 'active' : ''}`}
          onClick={() => goTab('chart')}
        >
          <span>🔷</span>
          <span>{t('nav.birthChart')}</span>
        </button>
        <button
          className={`mobile-nav-btn ${tab === 'effects' && !showForm ? 'active' : ''}`}
          onClick={() => goTab('effects')}
        >
          <span>🪐</span>
          <span>{t('nav.planetEffects')}</span>
        </button>
        <button
          className={`mobile-nav-btn ${tab === 'yogas' && !showForm ? 'active' : ''}`}
          onClick={() => goTab('yogas')}
        >
          <span>✨</span>
          <span>{t('nav.rajYogas')}</span>
        </button>
        <button
          className={`mobile-nav-btn ${sidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(o => !o)}
          aria-label="Open full menu"
        >
          <span>☰</span>
          <span>{t('nav.more')}</span>
        </button>
      </nav>
    </div>
  );
}

// ─── Root App Component ────────────────────────────────────────────────────────

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
