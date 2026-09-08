import React from 'react';
import type { KundaliChart } from '../../core/models';
import { PLANET_LABELS } from '../../core/constants';

interface Props { chart: KundaliChart; }

export default function Panchang({ chart }: Props) {
  const p = chart.panchang;
  const { birthData } = chart;

  return (
    <div className="fade-in">
      <div className="card card-gold mb-4">
        <div className="section-header mb-3">
          <div className="section-icon">🪔</div>
          <div>
            <h2>Panchang</h2>
            <p className="text-xs text-secondary">Five-limbed almanac for {birthData.dob} · {birthData.tob} · {birthData.cityName}</p>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title mb-3">📅 Five Limbs (Pañcāṅga)</div>
          <div className="info-row">
            <span className="label">1. Vaar (Day)</span>
            <span className="value">{p.vaar.name} <span className="text-xs text-secondary">(Lord: {PLANET_LABELS[p.vaar.lord].english})</span></span>
          </div>
          <div className="info-row">
            <span className="label">2. Tithi (Lunar Day)</span>
            <div>
              <span className="value">{p.tithi.name}</span>
              <span className="text-xs text-muted ml-2">{p.tithi.paksha} Paksha #{p.tithi.number}</span>
            </div>
          </div>
          <div className="info-row">
            <span className="label">3. Nakshatra</span>
            <div>
              <span className="value">{p.nakshatra.nakshatra.name}</span>
              <span className="text-xs text-muted ml-2">Pada {p.nakshatra.pada} · Lord: {PLANET_LABELS[p.nakshatra.nakshatra.lord].english}</span>
            </div>
          </div>
          <div className="info-row">
            <span className="label">4. Yoga</span>
            <div>
              <span className="value">{p.yoga.name}</span>
              <span className={`badge ml-2 ${p.yoga.isAuspicious ? 'badge-teal' : 'badge-crimson'}`} style={{ fontSize: '0.65rem' }}>
                {p.yoga.isAuspicious ? 'Auspicious' : 'Inauspicious'}
              </span>
            </div>
          </div>
          <div className="info-row">
            <span className="label">5. Karana</span>
            <span className="value">{p.karana.name}</span>
          </div>
        </div>

        <div className="card">
          <div className="card-title mb-3">⏰ Muhurtas & Timings</div>
          <div className="info-row">
            <span className="label">Ayanamsha (Lahiri)</span>
            <span className="value">{p.ayanamsha.toFixed(6)}°</span>
          </div>
          <div className="info-row">
            <span className="label">Rahu Kaal (approx)</span>
            <span className="value" style={{ color: 'var(--crimson-300)' }}>{p.rahuKaal}</span>
          </div>
          <div className="info-row">
            <span className="label">Abhijit Muhurat</span>
            <span className="value" style={{ color: 'var(--teal-300)' }}>{p.abhijitMuhurat}</span>
          </div>
          <div className="info-row">
            <span className="label">Paksha</span>
            <span className="value">{p.tithi.paksha === 'Shukla' ? '🌕 Shukla (Waxing Moon)' : '🌑 Krishna (Waning Moon)'}</span>
          </div>
          <div className="info-row">
            <span className="label">Birth Place Coordinates</span>
            <span className="value">{birthData.latitude.toFixed(4)}°N, {birthData.longitude.toFixed(4)}°E</span>
          </div>
          <div className="info-row">
            <span className="label">UTC Offset</span>
            <span className="value">UTC{birthData.timezone >= 0 ? '+' : ''}{birthData.timezone}</span>
          </div>
        </div>
      </div>

      {/* Tithi details */}
      <div className="card mt-4">
        <div className="card-title mb-3">🌙 Tithi & Paksha Significance</div>
        <p className="text-sm" style={{ lineHeight: 1.7 }}>
          {p.tithi.paksha === 'Shukla'
            ? `The native was born in Shukla Paksha (waxing Moon). Shukla Paksha births are considered naturally auspicious — the lunar energy is building and is associated with growth, vitality, and an outward, social nature. ${p.tithi.name} Tithi governs specific qualities: auspicious for new beginnings and religious work.`
            : `The native was born in Krishna Paksha (waning Moon). Krishna Paksha births are associated with an introspective nature, spiritual depth, and a preference for inner development over external show. The waning Moon can indicate a strong connection to past lives and spiritual inheritance.`
          }
        </p>
      </div>
    </div>
  );
}
