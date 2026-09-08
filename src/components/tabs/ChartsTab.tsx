import React, { useState } from 'react';
import { FullKundaliAnalysis, DivisionalChartType } from '../../types/astrology';
import { NorthIndianChart } from '../charts/NorthIndianChart';
import { SouthIndianChart } from '../charts/SouthIndianChart';
import { HOUSES_DATA, PLANETS_DATA, RASHIS } from '../../data/constants';
import { Sparkles, Grid, Eye, Compass, Info } from 'lucide-react';

interface ChartsTabProps {
  data: FullKundaliAnalysis;
}

export const ChartsTab: React.FC<ChartsTabProps> = ({ data }) => {
  const [selectedChartType, setSelectedChartType] = useState<DivisionalChartType>('D1');
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');
  const [selectedHouse, setSelectedHouse] = useState<number>(1);

  const divisionalTypes: { type: DivisionalChartType; label: string; desc: string }[] = [
    { type: 'D1', label: 'D1 Lagna', desc: 'Rashi Chart • Physical self & life path' },
    { type: 'D9', label: 'D9 Navamsha', desc: 'Marriage, dharma & soul potential' },
    { type: 'D10', label: 'D10 Dashamsha', desc: 'Career, profession, power & status' },
    { type: 'D7', label: 'D7 Saptamsha', desc: 'Children, lineage & creative legacy' },
    { type: 'D2', label: 'D2 Hora', desc: 'Wealth, prosperity & family assets' },
    { type: 'D3', label: 'D3 Drekkana', desc: 'Siblings, courage & stamina' },
    { type: 'D12', label: 'D12 Dwadashamsha', desc: 'Parents, ancestry & past karma' },
    { type: 'Chandra', label: 'Chandra Kundali', desc: 'Moon ascendant • Mind & feelings' },
    { type: 'Surya', label: 'Surya Kundali', desc: 'Sun ascendant • Soul vitality & authority' }
  ];

  const currentChart = data.divisionalCharts[selectedChartType];
  const houseData = currentChart.houses.find(h => h.houseNumber === selectedHouse) || currentChart.houses[0];
  const generalHouseSignificance = HOUSES_DATA[selectedHouse - 1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Chart Configuration Bar */}
      <div
        className="glass-card-gold"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div>
          <h2 className="text-gold-gradient" style={{ fontSize: '1.35rem', marginBottom: '2px' }}>
            {currentChart.sanskritTitle}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            {currentChart.purpose}
          </p>
        </div>

        {/* North vs South Indian Toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setChartStyle('north')}
            className={chartStyle === 'north' ? 'btn-gold' : 'btn-outline-gold'}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            <Compass size={14} /> North Indian (Diamond)
          </button>
          <button
            onClick={() => setChartStyle('south')}
            className={chartStyle === 'south' ? 'btn-gold' : 'btn-outline-gold'}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            <Grid size={14} /> South Indian (Box)
          </button>
        </div>
      </div>

      {/* Divisional Charts Switcher Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {divisionalTypes.map((dt) => (
          <button
            key={dt.type}
            onClick={() => setSelectedChartType(dt.type)}
            className={selectedChartType === dt.type ? 'btn-gold' : 'btn-outline-gold'}
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              textAlign: 'left'
            }}
          >
            <span style={{ fontWeight: '700' }}>{dt.label}</span>
            <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>{dt.desc.split('•')[0]}</span>
          </button>
        ))}
      </div>

      {/* Main Chart Viewer & House Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', alignItems: 'start' }}>
        {/* Visual Chart Canvas */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginBottom: '12px', fontSize: '0.85rem', color: '#f3e5ab' }}>
            Click on any house below to inspect its details & occupying planets
          </div>

          {chartStyle === 'north' ? (
            <NorthIndianChart
              chart={currentChart}
              highlightHouse={selectedHouse}
              onHouseClick={(h) => setSelectedHouse(h)}
            />
          ) : (
            <SouthIndianChart
              chart={currentChart}
              onHouseClick={(h) => setSelectedHouse(h)}
            />
          )}
        </div>

        {/* House Inspector Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <span className="badge-gold">House {selectedHouse} of 12</span>
              <h3 className="text-gold-gradient" style={{ fontSize: '1.25rem', marginTop: '4px' }}>
                {generalHouseSignificance.hindiName} ({generalHouseSignificance.sanskritName})
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedHouse(num)}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    background: selectedHouse === num ? '#d4af37' : 'rgba(255,255,255,0.05)',
                    color: selectedHouse === num ? '#070913' : '#cbd5e1',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: '700'
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* House Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '18px' }}>
            <div style={{ background: 'rgba(9, 14, 33, 0.7)', padding: '10px 14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Occupying Sign (Rashi)</div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#ffffff' }}>
                {houseData.rashi} ({houseData.rashiNumber})
              </div>
            </div>

            <div style={{ background: 'rgba(9, 14, 33, 0.7)', padding: '10px 14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>House Lord (Bhavesh)</div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#ffffff' }}>
                {RASHIS[houseData.rashiNumber - 1]?.lord}
              </div>
            </div>

            <div style={{ background: 'rgba(9, 14, 33, 0.7)', padding: '10px 14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Bhava Category</div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#ffffff' }}>
                {generalHouseSignificance.category}
              </div>
            </div>

            <div style={{ background: 'rgba(9, 14, 33, 0.7)', padding: '10px 14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Natural Karaka</div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#ffffff' }}>
                {generalHouseSignificance.karaka}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '16px', fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.6' }}>
            <strong style={{ color: '#f3e5ab' }}>Significance: </strong>
            {generalHouseSignificance.significance}
          </div>

          {/* Occupying Planets */}
          <div>
            <h4 style={{ fontSize: '0.95rem', color: '#f3e5ab', marginBottom: '10px' }}>
              Occupying Planets in House {selectedHouse} ({houseData.planets.length})
            </h4>

            {houseData.planets.length === 0 ? (
              <div style={{ padding: '14px', background: 'rgba(9, 14, 33, 0.5)', borderRadius: '10px', fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center' }}>
                No occupying planets in this house. The house results are primarily shaped by its Lord ({RASHIS[houseData.rashiNumber - 1]?.lord}) and transiting planets.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {houseData.planets.map((p) => {
                  const pData = PLANETS_DATA[p.name];
                  const fullPlanet = data.planets.find(pl => pl.name === p.name);

                  return (
                    <div
                      key={p.name}
                      style={{
                        background: 'rgba(9, 14, 33, 0.85)',
                        border: '1px solid rgba(212, 175, 55, 0.25)',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: `${pData.color}22`,
                            color: pData.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '0.85rem'
                          }}
                        >
                          {pData.symbol}
                        </span>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.92rem', color: '#f8fafc' }}>
                            {p.sanskritName} ({p.name})
                            {p.isRetrograde && <span style={{ color: '#f59e0b', fontSize: '0.78rem' }}> [Retrograde]</span>}
                            {p.isCombust && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}> *Combust</span>}
                          </div>
                          {fullPlanet && (
                            <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                              {fullPlanet.formattedDegree} • {fullPlanet.nakshatra} (P{fullPlanet.pada})
                            </div>
                          )}
                        </div>
                      </div>

                      {fullPlanet && (
                        <span
                          className={
                            fullPlanet.dignity === 'Exalted' || fullPlanet.dignity === 'Own Sign'
                              ? 'badge-emerald'
                              : fullPlanet.dignity === 'Debilitated'
                              ? 'badge-ruby'
                              : 'badge-gold'
                          }
                        >
                          {fullPlanet.dignity}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
