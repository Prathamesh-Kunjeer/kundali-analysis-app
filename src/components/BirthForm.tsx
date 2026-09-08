import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { BirthData } from '../core/models';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  onCalculate: (birth: BirthData) => void;
  isLoading: boolean;
  initialData?: BirthData;
  submitLabel?: string;
  hideTitle?: boolean;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

interface ResolvedLocation {
  cityName: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: number;   // UTC numeric offset e.g. 5.5
  tzName: string;     // IANA e.g. "Asia/Kolkata"
}

// ─── Sample Charts ──────────────────────────────────────────────────────────

const SAMPLES: { label: string; birth: BirthData }[] = [
  {
    label: 'Swami Vivekananda',
    birth: {
      name: 'Swami Vivekananda', gender: 'male', dob: '1863-01-12', tob: '06:33',
      latitude: 22.5726, longitude: 88.3639, timezone: 5.5, tzName: 'Asia/Kolkata',
      cityName: 'Kolkata', state: 'West Bengal', country: 'India',
    },
  },
  {
    label: 'Mahatma Gandhi',
    birth: {
      name: 'Mahatma Gandhi', gender: 'male', dob: '1869-10-02', tob: '07:11',
      latitude: 21.6420, longitude: 69.6080, timezone: 5.5, tzName: 'Asia/Kolkata',
      cityName: 'Porbandar', state: 'Gujarat', country: 'India',
    },
  },
  {
    label: 'Indira Gandhi',
    birth: {
      name: 'Indira Gandhi', gender: 'female', dob: '1917-11-19', tob: '23:11',
      latitude: 25.4358, longitude: 81.8463, timezone: 5.5, tzName: 'Asia/Kolkata',
      cityName: 'Allahabad', state: 'Uttar Pradesh', country: 'India',
    },
  },
];

// ─── Geocoding helpers ───────────────────────────────────────────────────────

// Search cities via Nominatim (OpenStreetMap) — free, no API key required
async function searchCities(query: string): Promise<NominatimResult[]> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', '8');
  url.searchParams.set('featuretype', 'city');

  const res = await fetch(url.toString(), {
    headers: {
      // Nominatim policy: include a meaningful User-Agent
      'User-Agent': 'JyotishVeda-KundaliApp/1.0 (contact: jyotishveda@example.com)',
      'Accept-Language': 'en',
    },
  });
  if (!res.ok) throw new Error('Location search failed');
  return res.json();
}

// Resolve IANA timezone + UTC offset from lat/lon via Open-Meteo (free, no key)
async function resolveTimezone(lat: number, lon: number): Promise<{ tzName: string; utcOffset: number }> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=auto&forecast_days=0&hourly=temperature_2m&forecast_hours=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Timezone lookup failed');
  const data = await res.json();
  const tzName: string = data.timezone ?? 'UTC';
  const utcOffsetSeconds: number = data.utc_offset_seconds ?? 0;
  const utcOffset = Math.round((utcOffsetSeconds / 3600) * 2) / 2; // round to 0.5 step
  return { tzName, utcOffset };
}

function cityLabel(r: NominatimResult): string {
  const a = r.address;
  const city = a.city ?? a.town ?? a.village ?? a.municipality ?? '';
  const state = a.state ?? a.county ?? '';
  const country = a.country ?? '';
  return [city, state, country].filter(Boolean).join(', ');
}

function extractCity(r: NominatimResult): string {
  const a = r.address;
  return a.city ?? a.town ?? a.village ?? a.municipality ?? r.display_name.split(',')[0].trim();
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function BirthForm({ onCalculate, isLoading, initialData, submitLabel, hideTitle }: Props) {
  const { t } = useLanguage();
  // Personal fields
  const [name, setName]     = useState(initialData?.name ?? '');
  const [gender, setGender] = useState(initialData?.gender ?? 'male');
  const [dob, setDob]       = useState(initialData?.dob ?? '');
  const [tob, setTob]       = useState(initialData?.tob ?? '12:00');

  // Location resolution
  const [citySearch, setCitySearch]           = useState('');
  const [suggestions, setSuggestions]         = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching]             = useState(false);
  const [resolving, setResolving]             = useState(false);
  const [searchError, setSearchError]         = useState('');
  const [resolved, setResolved]               = useState<ResolvedLocation | null>(
    initialData
      ? {
          cityName: initialData.cityName,
          state: initialData.state ?? '',
          country: initialData.country,
          latitude: initialData.latitude,
          longitude: initialData.longitude,
          timezone: initialData.timezone,
          tzName: initialData.tzName ?? '',
        }
      : null
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced Nominatim search
  const handleCityInput = useCallback((val: string) => {
    setCitySearch(val);
    setResolved(null);
    setSearchError('');
    setSuggestions([]);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 3) { setShowSuggestions(false); return; }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setShowSuggestions(true);
      try {
        const results = await searchCities(val);
        setSuggestions(results);
        if (results.length === 0) setSearchError(t('form.noCitiesFound'));
        else setSearchError('');
      } catch {
        setSearchError(t('form.searchUnavailable'));
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 450);
  }, [t]);

  // When user picks a suggestion
  const handleSelectCity = useCallback(async (r: NominatimResult) => {
    const lat = parseFloat(r.lat);
    const lon = parseFloat(r.lon);
    const city = extractCity(r);
    const state = r.address.state ?? r.address.county ?? '';
    const country = r.address.country ?? '';

    setCitySearch(cityLabel(r));
    setShowSuggestions(false);
    setSuggestions([]);
    setSearchError('');
    setResolving(true);

    try {
      const { tzName, utcOffset } = await resolveTimezone(lat, lon);
      setResolved({ cityName: city, state, country, latitude: lat, longitude: lon, timezone: utcOffset, tzName });
    } catch {
      // Fallback: estimate UTC offset from longitude (±15° per hour)
      const estimatedOffset = Math.round((lon / 15) * 2) / 2;
      setResolved({ cityName: city, state, country, latitude: lat, longitude: lon, timezone: estimatedOffset, tzName: '' });
      setSearchError(t('form.timezoneFallback'));
    } finally {
      setResolving(false);
    }
  }, [t]);

  const loadSample = (s: typeof SAMPLES[0]) => {
    setName(s.birth.name);
    setGender(s.birth.gender);
    setDob(s.birth.dob);
    setTob(s.birth.tob);
    setCitySearch(`${s.birth.cityName}, ${s.birth.state ?? ''}, ${s.birth.country}`.replace(', ,', ','));
    setResolved({
      cityName: s.birth.cityName,
      state: s.birth.state ?? '',
      country: s.birth.country,
      latitude: s.birth.latitude,
      longitude: s.birth.longitude,
      timezone: s.birth.timezone,
      tzName: s.birth.tzName ?? '',
    });
    setShowSuggestions(false);
    setSearchError('');
  };

  const canSubmit = !!name && !!dob && !!tob && !!resolved && !resolving;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !resolved) return;
    onCalculate({
      id: crypto.randomUUID(),
      name, gender, dob, tob,
      latitude: resolved.latitude,
      longitude: resolved.longitude,
      timezone: resolved.timezone,
      tzName: resolved.tzName,
      cityName: resolved.cityName,
      state: resolved.state,
      country: resolved.country,
    });
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = () => setShowSuggestions(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <div className={hideTitle ? '' : 'card card-gold'} style={hideTitle ? {} : { maxWidth: 840, margin: '1.5rem auto' }}>
      {!hideTitle && (
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 54, height: 54, borderRadius: '50%', background: 'var(--brand-glow)',
            border: '1.5px solid var(--border-gold)', fontSize: '1.6rem', marginBottom: '0.6rem',
            boxShadow: 'var(--shadow-glow-gold)'
          }}>
            🔮
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem' }}>
            {t('form.title')}
          </h2>
          <p className="text-sm text-secondary" style={{ maxWidth: 540, marginInline: 'auto' }}>
            {t('form.subtitle')}
          </p>
        </div>
      )}

      {/* Multi-step progress visual indicator */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.5rem',
        marginBottom: '1.5rem',
      }}>
        {[
          { num: '01', title: t('form.fullName'), done: !!name && !!dob && !!tob },
          { num: '02', title: t('form.birthPlace'), done: !!resolved },
          { num: '03', title: t('form.submit'), done: canSubmit },
        ].map(st => (
          <div
            key={st.num}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              background: st.done ? 'var(--brand-glow)' : 'var(--surface-overlay)',
              border: `1px solid ${st.done ? 'var(--border-brand)' : 'var(--border-subtle)'}`,
              transition: 'all 0.2s',
            }}
          >
            <span style={{
              fontWeight: 800,
              fontSize: '0.72rem',
              color: st.done ? 'var(--brand-400)' : 'var(--text-muted)',
            }}>
              {st.num}
            </span>
            <span style={{
              fontSize: '0.76rem',
              fontWeight: st.done ? 600 : 400,
              color: st.done ? 'var(--text-primary)' : 'var(--text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {st.title}
            </span>
          </div>
        ))}
      </div>

      {/* Sample Charts */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        padding: '0.6rem 0.85rem',
        background: 'var(--surface-overlay)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)'
      }}>
        <span className="text-xs text-muted" style={{ fontWeight: 600 }}>{t('form.loadSample')}</span>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {SAMPLES.map(s => (
            <button key={s.label} className="btn btn-ghost" type="button"
              onClick={() => loadSample(s)}
              style={{ padding: '0.2rem 0.65rem', fontSize: '0.75rem', borderRadius: 'var(--radius-xs)', background: 'var(--surface-raised)' }}>
              ✦ {s.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Personal Details */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--brand-400)', fontWeight: 700, marginBottom: '0.6rem' }}>
            01 · {t('form.fullName')} & {t('form.dob')}
          </div>
          <div className="grid-2" style={{ gap: '0.85rem' }}>
            {/* Name */}
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">{t('form.fullName')}</label>
              <input className="form-control" placeholder={t('form.namePlaceholder')}
                value={name} onChange={e => setName(e.target.value)} required />
            </div>

            {/* DOB */}
            <div className="form-group">
              <label className="form-label">{t('form.dob')}</label>
              <input className="form-control" type="date" value={dob}
                onChange={e => setDob(e.target.value)} required />
            </div>

            {/* TOB */}
            <div className="form-group">
              <label className="form-label">{t('form.tob')}</label>
              <input className="form-control" type="time" value={tob}
                onChange={e => setTob(e.target.value)} required />
            </div>

            {/* Gender */}
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">{t('form.gender')}</label>
              <select className="form-control" value={gender} onChange={e => setGender(e.target.value as BirthData['gender'])}>
                <option value="male">{t('form.male')}</option>
                <option value="female">{t('form.female')}</option>
                <option value="other">{t('form.other')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Birth Location (Nominatim) */}
        <div style={{ marginBottom: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--brand-400)', fontWeight: 700, marginBottom: '0.6rem' }}>
            02 · {t('form.birthPlace')}
          </div>

          <div className="form-group" style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <label className="form-label">
              {t('form.birthPlace')}
              <span className="text-muted" style={{ fontWeight: 400, textTransform: 'none', marginLeft: 6 }}>
                {t('form.birthPlaceHint')}
              </span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-control"
                placeholder={t('form.cityPlaceholder')}
                value={citySearch}
                autoComplete="off"
                onChange={e => handleCityInput(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                aria-label="Search city of birth"
                aria-autocomplete="list"
                aria-expanded={showSuggestions}
              />
              {(searching || resolving) && (
                <span style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  fontSize: '0.78rem', color: 'var(--brand-400)', fontWeight: 600
                }}>
                  {resolving ? t('form.resolving') : t('form.searching')}
                </span>
              )}
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 300,
                background: 'var(--surface-raised)', border: '1px solid var(--border-brand)',
                borderRadius: 'var(--radius-md)', overflow: 'hidden',
                boxShadow: 'var(--shadow-elevated)', maxHeight: 280, overflowY: 'auto',
              }}>
                {suggestions.map(r => (
                  <div key={r.place_id}
                    onMouseDown={e => { e.preventDefault(); handleSelectCity(r); }}
                    style={{
                      padding: '0.65rem 0.95rem', cursor: 'pointer',
                      borderBottom: '1px solid var(--border-subtle)',
                      fontSize: '0.84rem',
                    }}
                    className="flex justify-between items-center"
                  >
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {extractCity(r)}
                    </span>
                    <span className="text-xs text-muted" style={{ marginLeft: 8, flexShrink: 0 }}>
                      {[r.address.state, r.address.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Search error / hint */}
            {searchError && (
              <p className="text-xs" style={{ marginTop: 6, color: 'var(--warn-fg)' }}>
                ⚠ {searchError}
              </p>
            )}
          </div>

          {/* Resolved Location Card */}
          {resolved && (
            <div className="fade-in" style={{
              background: 'var(--brand-glow)',
              border: '1px solid var(--border-brand)',
              borderRadius: 'var(--radius-md)',
              padding: '0.95rem 1.15rem',
              marginTop: '0.85rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.1rem' }}>📍</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--brand-400)' }}>
                  {t('form.locationResolved')}
                </span>
                <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>Auto</span>
              </div>

              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.6rem' }}>
                {[resolved.cityName, resolved.state, resolved.country].filter(Boolean).join(', ')}
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '0.5rem 1rem', fontSize: '0.8rem',
              }}>
                {[
                  { label: t('form.latitude'),  value: resolved.latitude.toFixed(4) + '°' },
                  { label: t('form.longitude'), value: resolved.longitude.toFixed(4) + '°' },
                  { label: t('form.utcOffset'), value: `UTC${resolved.timezone >= 0 ? '+' : ''}${resolved.timezone}` },
                  ...(resolved.tzName ? [{ label: t('form.timezone'), value: resolved.tzName }] : []),
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: 'var(--surface-overlay)', padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-xs)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {label}
                    </span>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted" style={{ marginTop: '0.6rem', fontSize: '0.7rem' }}>
                {t('form.geoAttribution')}
              </p>
            </div>
          )}

          {/* No-location hint when city box is empty */}
          {!resolved && !searching && !resolving && citySearch.length === 0 && (
            <p className="text-xs text-muted" style={{ marginTop: '0.5rem' }}>
              {t('form.emptyCityHint')}
            </p>
          )}
        </div>

        {/* Step 3: Submit Button */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center',
        }}>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={isLoading || !canSubmit}
            title={!resolved ? t('form.selectCityFirst') : ''}
            style={{
              padding: '0.85rem 2.75rem',
              fontSize: '1rem',
              fontWeight: 700,
              boxShadow: canSubmit ? 'var(--shadow-glow-gold)' : undefined,
            }}
          >
            {isLoading ? t('form.calculating') : (submitLabel ?? `🔮 ${t('form.submit')}`)}
          </button>
          {!resolved && !resolving && (
            <p className="text-xs text-muted" style={{ marginTop: '0.6rem' }}>
              {t('form.selectCityToEnable')}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
