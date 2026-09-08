import React, { useState } from 'react';
import { BirthDetails } from '../../types/astrology';
import { CITIES, CityData } from '../../data/cities';
import { Sparkles, MapPin, Clock, Calendar, User, Compass, Star } from 'lucide-react';

interface BirthDetailsFormProps {
  initialDetails: BirthDetails;
  onSubmit: (details: BirthDetails) => void;
  isLoading?: boolean;
}

const SAMPLE_CHARTS: { label: string; details: BirthDetails }[] = [
  {
    label: 'Swami Vivekananda',
    details: {
      name: 'Swami Vivekananda',
      gender: 'male',
      dob: '1863-01-12',
      tob: '06:33',
      cityName: 'Kolkata',
      country: 'India',
      latitude: 22.5726,
      longitude: 88.3639,
      timezone: 5.5
    }
  },
  {
    label: 'APJ Abdul Kalam',
    details: {
      name: 'Dr. APJ Abdul Kalam',
      gender: 'male',
      dob: '1931-10-15',
      tob: '01:15',
      cityName: 'Rameswaram (Madurai)',
      country: 'India',
      latitude: 9.2876,
      longitude: 79.3129,
      timezone: 5.5
    }
  },
  {
    label: 'Standard Modern Sample',
    details: {
      name: 'Aarav Sharma',
      gender: 'male',
      dob: '1998-07-15',
      tob: '09:45',
      cityName: 'New Delhi',
      country: 'India',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5
    }
  }
];

export const BirthDetailsForm: React.FC<BirthDetailsFormProps> = ({
  initialDetails,
  onSubmit,
  isLoading
}) => {
  const [formData, setFormData] = useState<BirthDetails>(initialDetails);
  const [cityQuery, setCityQuery] = useState(initialDetails.cityName || '');
  const [filteredCities, setFilteredCities] = useState<CityData[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCitySearch = (query: string) => {
    setCityQuery(query);
    if (query.trim().length >= 2) {
      const q = query.toLowerCase();
      const matches = CITIES.filter(
        c => c.name.toLowerCase().includes(q) || (c.state && c.state.toLowerCase().includes(q))
      ).slice(0, 8);
      setFilteredCities(matches);
      setShowCityDropdown(true);
    } else {
      setFilteredCities([]);
      setShowCityDropdown(false);
    }
  };

  const handleSelectCity = (city: CityData) => {
    setFormData(prev => ({
      ...prev,
      cityName: city.name,
      country: city.country,
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: city.timezone
    }));
    setCityQuery(`${city.name}${city.state ? `, ${city.state}` : ''}, ${city.country}`);
    setShowCityDropdown(false);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(4));
          const lon = parseFloat(pos.coords.longitude.toFixed(4));
          // Estimate timezone offset from browser
          const tz = -new Date().getTimezoneOffset() / 60;
          setFormData(prev => ({
            ...prev,
            cityName: 'Current Location',
            country: 'GPS Detected',
            latitude: lat,
            longitude: lon,
            timezone: tz
          }));
          setCityQuery(`GPS: ${lat}°, ${lon}°`);
        },
        (err) => {
          alert('Could not obtain GPS location. Please select your city from the search list.');
        }
      );
    }
  };

  const handleSampleSelect = (sample: BirthDetails) => {
    setFormData(sample);
    setCityQuery(`${sample.cityName}, ${sample.country}`);
    onSubmit(sample);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="glass-card-gold" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto 28px' }}>
      {/* Header with Title & Quick Presets */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px' }}>
        <div>
          <h2 className="text-gold-gradient" style={{ fontSize: '1.45rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#d4af37" /> Janam Kundali Birth Details
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Enter exact birth date, time and place for Sidereal Lahiri astronomical calculation
          </p>
        </div>

        {/* Celebrity / Sample Presets */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {SAMPLE_CHARTS.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => handleSampleSelect(sample.details)}
              className="btn-outline-gold"
              style={{ fontSize: '0.75rem', padding: '5px 10px' }}
            >
              <Star size={12} /> {sample.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          {/* Full Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: '#f3e5ab' }}>
              <User size={14} style={{ display: 'inline', marginRight: '4px' }} /> Full Name
            </label>
            <input
              type="text"
              required
              className="input-cosmic"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Aarav Sharma"
            />
          </div>

          {/* Gender */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: '#f3e5ab' }}>
              Gender
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['male', 'female', 'other'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: g })}
                  className={formData.gender === g ? 'btn-gold' : 'btn-outline-gold'}
                  style={{ flex: 1, padding: '8px 10px', fontSize: '0.82rem', textTransform: 'capitalize' }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: '#f3e5ab' }}>
              <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} /> Date of Birth
            </label>
            <input
              type="date"
              required
              className="input-cosmic"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            />
          </div>

          {/* Time of Birth */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: '#f3e5ab' }}>
              <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} /> Exact Time of Birth (24h)
            </label>
            <input
              type="time"
              required
              className="input-cosmic"
              value={formData.tob}
              onChange={(e) => setFormData({ ...formData, tob: e.target.value })}
            />
          </div>
        </div>

        {/* Place of Birth & City Search */}
        <div style={{ marginBottom: '16px', position: 'relative' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: '#f3e5ab' }}>
            <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> Place of Birth (Search City)
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              required
              className="input-cosmic"
              value={cityQuery}
              onChange={(e) => handleCitySearch(e.target.value)}
              placeholder="Search city (e.g. New Delhi, Mumbai, Bengaluru, London, Dubai...)"
            />
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="btn-outline-gold"
              title="Use GPS Coordinates"
              style={{ whiteSpace: 'nowrap' }}
            >
              <Compass size={16} /> GPS
            </button>
          </div>

          {/* City Autocomplete Dropdown */}
          {showCityDropdown && filteredCities.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 50,
                background: '#0d1224',
                border: '1px solid var(--border-gold)',
                borderRadius: '12px',
                marginTop: '4px',
                maxHeight: '220px',
                overflowY: 'auto',
                boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
              }}
            >
              {filteredCities.map((c, i) => (
                <div
                  key={`${c.name}-${i}`}
                  onClick={() => handleSelectCity(c)}
                  style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(212, 175, 55, 0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ color: '#f8fafc', fontWeight: '600' }}>
                    {c.name}{c.state ? `, ${c.state}` : ''}, <span style={{ color: '#94a3b8' }}>{c.country}</span>
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#d4af37' }}>
                    {c.latitude.toFixed(2)}°N, {c.longitude.toFixed(2)}°E (UTC{c.timezone >= 0 ? `+${c.timezone}` : c.timezone})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Collapsible Advanced Coordinates Toggle */}
        <div style={{ marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="btn-ghost"
            style={{ fontSize: '0.8rem', padding: '4px 8px' }}
          >
            {showAdvanced ? '▲ Hide Exact Coordinates' : '▼ Edit Coordinates & Timezone Manually'}
          </button>

          {showAdvanced && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '12px',
                marginTop: '10px',
                padding: '12px',
                background: 'rgba(9, 14, 33, 0.6)',
                borderRadius: '10px',
                border: '1px solid rgba(212, 175, 55, 0.15)'
              }}
            >
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Latitude (°)</label>
                <input
                  type="number"
                  step="0.0001"
                  className="input-cosmic"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Longitude (°)</label>
                <input
                  type="number"
                  step="0.0001"
                  className="input-cosmic"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Timezone Offset (Hours)</label>
                <input
                  type="number"
                  step="0.25"
                  className="input-cosmic"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: parseFloat(e.target.value) || 5.5 })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-gold"
            style={{ width: '100%', maxWidth: '340px', padding: '12px 24px', fontSize: '1.05rem' }}
          >
            <Sparkles size={18} /> {isLoading ? 'Calculating Ephemeris...' : 'Generate Full Janam Kundali'}
          </button>
        </div>
      </form>
    </div>
  );
};
