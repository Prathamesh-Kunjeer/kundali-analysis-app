import React, { useState } from 'react';
import type { KundaliChart, Planet } from '../../core/models';
import { PLANET_LABELS } from '../../core/constants';
import { useLanguage } from '../../context/LanguageContext';

interface Props { chart: KundaliChart }

/* ─── Planet colours ──────────────────────────────────────────────────────── */
const PC: Record<string, string> = {
  Sun:'#e07b39', Moon:'#7b9fd4', Mars:'#d94f4f', Mercury:'#4aad78',
  Jupiter:'#c9a227', Venus:'#c060a0', Saturn:'#5577b8', Rahu:'#8f5baa',
  Ketu:'#7d8a94', Ascendant:'#c9a227',
};

/* Canonical glyphs — use these everywhere for consistency */
const GLYPHS: Record<string, string> = {
  Sun:'☉', Moon:'☽', Mars:'♂', Mercury:'☿', Jupiter:'♃',
  Venus:'♀', Saturn:'♄', Rahu:'☊', Ketu:'☋', Ascendant:'⬆',
};

const SIGN_SYM: Record<string, string> = {
  Aries:'♈',Taurus:'♉',Gemini:'♊',Cancer:'♋',Leo:'♌',Virgo:'♍',
  Libra:'♎',Scorpio:'♏',Sagittarius:'♐',Capricorn:'♑',Aquarius:'♒',Pisces:'♓',
};

/* ─── Geometry ───────────────────────────────────────────────────────────── */
const S = 500, S2 = 250, S4 = 125, S34 = 375;

/* North Indian Kundali — standard anticlockwise sequence.
 * H1=top, anticlockwise: H2=NW, H3=W-upper, H4=left, H5=W-lower,
 * H6=SW, H7=bottom, H8=SE, H9=E-lower, H10=right, H11=E-upper, H12=NE.
 * pts/tx/ty/big geometry unchanged; only n values corrected. */
const HOUSES = [
  { n:1,  pts:`${S2},0 ${S4},${S4} ${S2},${S2} ${S34},${S4}`,      tx:S2,    ty:S4,     big:true  },
  { n:4,  pts:`${S},${S2} ${S34},${S4} ${S2},${S2} ${S34},${S34}`, tx:S34+40,ty:S2,     big:true  },
  { n:7,  pts:`${S2},${S} ${S34},${S34} ${S2},${S2} ${S4},${S34}`, tx:S2,    ty:S34+44, big:true  },
  { n:10, pts:`${0},${S2} ${S4},${S34} ${S2},${S2} ${S4},${S4}`,   tx:S4-44, ty:S2,     big:true  },
  { n:12, pts:`${S2},0 ${S},0 ${S34},${S4}`,                        tx:S34+38,ty:38,     big:false },
  { n:11, pts:`${S},0 ${S},${S2} ${S34},${S4}`,                     tx:460,   ty:S4,     big:false },
  { n:9,  pts:`${S},${S2} ${S},${S} ${S34},${S34}`,                 tx:460,   ty:S34+42, big:false },
  { n:8,  pts:`${S},${S} ${S2},${S} ${S34},${S34}`,                 tx:S34+38,ty:462,    big:false },
  { n:6,  pts:`${S2},${S} ${0},${S} ${S4},${S34}`,                  tx:S4-38, ty:462,    big:false },
  { n:5,  pts:`${0},${S} ${0},${S2} ${S4},${S34}`,                  tx:40,    ty:S34+42, big:false },
  { n:3,  pts:`${0},${S2} ${0},0 ${S4},${S4}`,                      tx:40,    ty:S4,     big:false },
  { n:2,  pts:`${0},0 ${S2},0 ${S4},${S4}`,                         tx:S4-38, ty:38,     big:false },
];

const LINES = [
  [[0,0],[S4,S4]], [[S2,0],[S4,S4]], [[0,S2],[S4,S4]], [[S2,S2],[S4,S4]],
  [[S,0],[S34,S4]], [[S2,0],[S34,S4]], [[S,S2],[S34,S4]], [[S2,S2],[S34,S4]],
  [[S,S],[S34,S34]], [[S2,S],[S34,S34]], [[S,S2],[S34,S34]], [[S2,S2],[S34,S34]],
  [[0,S],[S4,S34]], [[S2,S],[S4,S34]], [[0,S2],[S4,S34]], [[S2,S2],[S4,S34]],
];


/* ─── Decorative border (unchanged) ──────────────────────────────────────── */
function BorderOrnament({ size }: { size: number }) {
  const PAD = 28, R = size;
  const bx = PAD / 2, bw = R - PAD;

  function Rosette({ cx, cy }: { cx: number; cy: number }) {
    const r = 5.5, pr = 10;
    const petals = Array.from({ length: 8 }, (_, i) => {
      const a = (i * 45 * Math.PI) / 180;
      const px = cx + Math.cos(a) * pr, py = cy + Math.sin(a) * pr;
      return `M${cx},${cy} Q${px - 5 * Math.sin(a)},${py + 5 * Math.cos(a)} ${px},${py} Q${px + 5 * Math.sin(a)},${py - 5 * Math.cos(a)} ${cx},${cy}`;
    });
    return (
      <g>
        {petals.map((d, i) => <path key={i} d={d} fill="var(--chart-border-gold)" opacity={0.85} />)}
        <circle cx={cx} cy={cy} r={r} fill="var(--chart-border-gold)" />
        <circle cx={cx} cy={cy} r={2.5} fill="var(--chart-border-out)" />
      </g>
    );
  }

  function DiamondRow({ axis, count, start, end, fixed }:
    { axis: 'x' | 'y'; count: number; start: number; end: number; fixed: number }) {
    const step = (end - start) / (count + 1);
    return (
      <g>
        {Array.from({ length: count }, (_, i) => {
          const pos = start + step * (i + 1);
          const [x, y] = axis === 'x' ? [pos, fixed] : [fixed, pos];
          const s = 4;
          return <path key={i} d={`M${x},${y - s} L${x + s},${y} L${x},${y + s} L${x - s},${y}Z`} fill="var(--chart-border-gold)" opacity={0.6} />;
        })}
      </g>
    );
  }

  return (
    <g>
      <rect x={0} y={0} width={R} height={R} rx={4} style={{ fill:'var(--chart-border-out)' }} />
      <rect x={bx} y={bx} width={bw} height={bw} rx={3} fill="none" stroke="var(--chart-border-gold)" strokeWidth={1.5} />
      <rect x={bx+4} y={bx+4} width={bw-8} height={bw-8} rx={2} fill="none" stroke="var(--chart-border-gold)" strokeWidth={0.5} opacity={0.5} />
      <DiamondRow axis="x" count={6} start={PAD*2} end={R-PAD*2} fixed={bx+7} />
      <DiamondRow axis="x" count={6} start={PAD*2} end={R-PAD*2} fixed={bw+PAD/2-7} />
      <DiamondRow axis="y" count={6} start={PAD*2} end={R-PAD*2} fixed={bx+7} />
      <DiamondRow axis="y" count={6} start={PAD*2} end={R-PAD*2} fixed={bw+PAD/2-7} />
      <Rosette cx={PAD/2} cy={PAD/2} />
      <Rosette cx={R-PAD/2} cy={PAD/2} />
      <Rosette cx={R-PAD/2} cy={R-PAD/2} />
      <Rosette cx={PAD/2} cy={R-PAD/2} />
      <g transform={`translate(${R/2}, ${PAD/2})`}>
        <rect x={-18} y={-5} width={36} height={10} rx={5} style={{ fill:'var(--chart-border-out)' }} />
        <path d="M-14,2 L-18,-5 L-10,-2 L0,-8 L10,-2 L18,-5 L14,2 Z" fill="var(--chart-border-gold)" opacity={0.9} />
        <circle r={3} fill="var(--chart-border-gold)" />
      </g>
    </g>
  );
}

/* ─── Planet block renderer (NEW — the core improvement) ─────────────────── */
/**
 * Renders a stacked planet entry inside an SVG house cell.
 *
 * Layout per planet (two SVG text lines):
 *   Line 1: GLYPH  Name       ← larger, colored, primary
 *   Line 2: 18°24' [℞]        ← smaller, muted, secondary
 *
 * Font sizes auto-scale based on planet count so nothing overlaps.
 * big=true → diamond house (more vertical space)
 * big=false → triangle corner house (tighter)
 */
function PlanetBlock({
  planetNames,
  chart,
  cx,           // x centroid (SVG coords, already PAD-adjusted)
  startY,       // y to start stacking from
  big,
  selectedPlanet,
  onSelectPlanet,
}: {
  planetNames: string[];
  chart: KundaliChart;
  cx: number;
  startY: number;
  big: boolean;
  selectedPlanet: string | null;
  onSelectPlanet: (p: string) => void;
}) {
  if (planetNames.length === 0) return null;

  const count = planetNames.length;

  // Auto-scale: more planets → smaller fonts, tighter gap
  // big cell: 1→(14,10,18), 2→(12,9,16), 3+(→11,8,14)
  // small cell: 1→(11,8,14), 2+(→10,7,13)
  const nameFontSize  = big ? (count === 1 ? 13 : count === 2 ? 11 : 10) : (count === 1 ? 10 : 9);
  const degFontSize   = big ? (count === 1 ? 9.5 : count === 2 ? 8.5 : 7.5) : (count === 1 ? 8 : 7);
  const glyphFontSize = nameFontSize + 2;
  const lineGap       = big ? (count === 1 ? 20 : count === 2 ? 18 : 16) : (count === 1 ? 17 : 14);

  return (
    <>
      {planetNames.map((p, i) => {
        const pos  = chart.planets[p as keyof typeof chart.planets];
        const glyph = GLYPHS[p] ?? PLANET_LABELS[p as keyof typeof PLANET_LABELS]?.symbol ?? '?';
        const name  = PLANET_LABELS[p as keyof typeof PLANET_LABELS]?.english ?? p;
        const col   = PC[p] ?? 'var(--chart-text)';
        const isRetro   = pos?.isRetrograde ?? false;
        const isCombust = pos?.isCombust ?? false;
        const deg   = pos?.degreeInSign ?? 0;
        const degD  = Math.floor(deg);
        const degM  = Math.floor((deg - degD) * 60);
        const degStr = `${degD}°${String(degM).padStart(2,'0')}'`;
        const isSelected = selectedPlanet === p;

        const blockY = startY + i * lineGap * 2;

        // Highlight ring for selected planet
        const ringR = glyphFontSize * 0.72;

        return (
          <g
            key={p}
            onClick={() => onSelectPlanet(isSelected ? '' : p)}
            style={{ cursor: 'pointer' }}
          >
            {/* Selection highlight */}
            {isSelected && (
              <ellipse
                cx={cx} cy={blockY + 1}
                rx={name.length * (nameFontSize * 0.38) + ringR + 6}
                ry={nameFontSize * 0.75}
                fill={col} opacity={0.15}
              />
            )}

            {/* Line 1: glyph + name */}
            <text
              x={cx} y={blockY}
              textAnchor="middle" dominantBaseline="central"
              fontFamily="Inter, system-ui, sans-serif"
              fontSize={nameFontSize}
              fontWeight="700"
              style={{ fill: col }}
            >
              <tspan fontFamily="serif" fontSize={glyphFontSize}>{glyph}</tspan>
              {' '}{name}
            </text>

            {/* Line 2: degree [℞][☄] */}
            <text
              x={cx} y={blockY + lineGap}
              textAnchor="middle" dominantBaseline="central"
              fontFamily="Inter, system-ui, sans-serif"
              fontSize={degFontSize}
              style={{ fill: 'var(--chart-text-sub)', opacity: 0.88 }}
            >
              {degStr}{isRetro ? ' ℞' : ''}{isCombust ? ' ☄' : ''}
            </text>
          </g>
        );
      })}
    </>
  );
}

export function NorthIndianChart({
  chart,
  selectedPlanet = null,
  onSelectPlanet = () => {},
}: Props & { selectedPlanet?: string | null; onSelectPlanet?: (p: string) => void }) {
  const [hoveredHouse, setHoveredHouse] = useState<number | null>(null);
  const TOTAL = 556, PAD = 28;

  const getPlanets = (houseNum: number) =>
    Object.entries(chart.planets)
      .filter(([n, p]) => n !== 'Ascendant' && p.house === houseNum)
      .map(([n]) => n);

  return (
    <svg viewBox={`0 0 ${TOTAL} ${TOTAL}`} style={{ width:'100%', maxWidth:TOTAL }}
      role="img" aria-label="North Indian Kundali Chart">

      <BorderOrnament size={TOTAL} />
      <rect x={PAD} y={PAD} width={S} height={S} style={{ fill:'var(--chart-bg)' }} />

      <defs>
        {HOUSES.map(h => (
          <clipPath key={`cp${h.n}`} id={`cp${h.n}`}>
            <polygon points={h.pts.split(' ').map(p => {
              const [x, y] = p.split(',').map(Number);
              return `${x+PAD},${y+PAD}`;
            }).join(' ')} />
          </clipPath>
        ))}
      </defs>

      {/* House cell backgrounds */}
      {HOUSES.map(h => {
        const pts = h.pts.split(' ').map(p => p.split(',').map(Number));
        const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
        const minX = Math.min(...xs), maxX = Math.max(...xs);
        const minY = Math.min(...ys), maxY = Math.max(...ys);
        const ins = h.big ? 14 : 10;
        const rx  = h.big ? 28 : 22;
        const isLagna = h.n === 1;
        const isHov   = hoveredHouse === h.n;
        return (
          <g key={h.n} clipPath={`url(#cp${h.n})`}>
            <rect
              x={PAD+minX+ins} y={PAD+minY+ins}
              width={maxX-minX-ins*2} height={maxY-minY-ins*2}
              rx={rx} ry={rx}
              style={{
                fill: isLagna ? 'var(--chart-h1-fill)' :
                      isHov   ? 'var(--chart-rounded-fill)' : 'var(--chart-rounded-fill)',
                stroke: isLagna ? 'var(--chart-border-gold)' : 'var(--chart-line-inner)',
                strokeWidth: isLagna ? 2 : 1,
                transition:'fill 0.15s',
              }}
            />
          </g>
        );
      })}

      {/* Grid lines */}
      {LINES.map(([[x1,y1],[x2,y2]], i) => (
        <line key={i} x1={PAD+x1} y1={PAD+y1} x2={PAD+x2} y2={PAD+y2}
          style={{ stroke:'var(--chart-line)' }} strokeWidth={1.5} strokeLinecap="round" />
      ))}
      <rect x={PAD} y={PAD} width={S} height={S} fill="none"
        style={{ stroke:'var(--chart-line)' }} strokeWidth={2} />

      {/* House labels + planets */}
      {HOUSES.map(h => {
        const houseData = chart.houses[h.n - 1];
        const sign      = houseData?.sign ?? '';
        const planets   = getPlanets(h.n);
        const isLagna   = h.n === 1;
        const tx = PAD + h.tx, ty = PAD + h.ty;

        // Vertical layout within the cell:
        //   [house#] ... [LAGNA] ... [signSym + abbr] ... [planets start here]
        // For big (diamond) cells: sign centroid is at ty, planets begin below
        // For small (triangle) cells: everything compressed

        const signSymY  = ty + (isLagna ? 8 : 0);
        const signAbbY  = signSymY + (h.big ? 14 : 11);
        const planetsStartY = signAbbY + (h.big ? (planets.length > 2 ? 14 : 16) : (planets.length > 1 ? 13 : 14));

        return (
          <g key={`t${h.n}`}
            onMouseEnter={() => setHoveredHouse(h.n)}
            onMouseLeave={() => setHoveredHouse(null)}
          >
            {/* House number — top, small, muted */}
            <text x={tx} y={ty - (h.big ? 30 : 20)}
              textAnchor="middle" dominantBaseline="middle"
              style={{ fill:'var(--chart-text-sub)' }}
              fontSize={h.big ? 8.5 : 7} fontFamily="Inter, sans-serif" opacity={0.6}>
              {h.n}
            </text>

            {/* Lagna label */}
            {isLagna && (
              <text x={tx} y={ty - 14} textAnchor="middle"
                style={{ fill:'var(--chart-border-gold)' }}
                fontSize={7} fontFamily="Inter, sans-serif" fontWeight="700" opacity={0.85}>
                LAGNA
              </text>
            )}

            {/* Sign symbol (larger) */}
            <text x={tx} y={signSymY} textAnchor="middle" dominantBaseline="middle"
              style={{ fill: isLagna ? 'var(--chart-border-gold)' : 'var(--chart-text)' }}
              fontSize={h.big ? 15 : 12} fontFamily="serif">
              {SIGN_SYM[sign] ?? '?'}
            </text>

            {/* Sign abbreviation */}
            <text x={tx} y={signAbbY} textAnchor="middle"
              style={{ fill:'var(--chart-text-sub)' }}
              fontSize={h.big ? 7.5 : 6} fontFamily="Inter, sans-serif">
              {sign.substring(0, 3).toUpperCase()}
            </text>

            {/* Planet blocks — the main improvement */}
            <PlanetBlock
              planetNames={planets}
              chart={chart}
              cx={tx}
              startY={planetsStartY}
              big={h.big}
              selectedPlanet={selectedPlanet}
              onSelectPlanet={onSelectPlanet}
            />

            {/* House hover tooltip (preserved) */}
            {hoveredHouse === h.n && (
              <g>
                <rect x={tx-65} y={ty-58} width={130} height={48} rx={6}
                  style={{ fill:'var(--chart-bg-cell)' }}
                  stroke="var(--chart-border-gold)" strokeWidth={1} opacity={0.97} />
                <text x={tx} y={ty-44} textAnchor="middle"
                  style={{ fill:'var(--chart-border-gold)' }}
                  fontSize={8.5} fontWeight="700" fontFamily="Cinzel, serif">
                  House {h.n} · {sign}
                </text>
                <text x={tx} y={ty-30} textAnchor="middle"
                  style={{ fill:'var(--chart-text-sub)' }}
                  fontSize={7.5} fontFamily="Inter, sans-serif">
                  {planets.length ? planets.map(p => PLANET_LABELS[p as keyof typeof PLANET_LABELS]?.english).join(', ') : 'Empty'}
                </text>
                <text x={tx} y={ty-18} textAnchor="middle"
                  style={{ fill:'var(--chart-text-sub)' }}
                  fontSize={7} fontFamily="Inter, sans-serif">
                  Lord: {houseData?.lord ?? '—'}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ─── South Indian Chart ──────────────────────────────────────────────────── */
function SouthIndianChart({
  chart,
  selectedPlanet,
  onSelectPlanet,
}: Props & { selectedPlanet: string | null; onSelectPlanet: (p: string) => void }) {
  const [hoveredSign, setHoveredSign] = useState<number | null>(null);
  const { houses, planets } = chart;
  const TOTAL = 556, PAD = 28, cellS = S / 4;

  const GRID = [
    { col:0,row:0,signIndex:11 },{ col:1,row:0,signIndex:0  },
    { col:2,row:0,signIndex:1  },{ col:3,row:0,signIndex:2  },
    { col:3,row:1,signIndex:3  },{ col:3,row:2,signIndex:4  },
    { col:3,row:3,signIndex:5  },{ col:2,row:3,signIndex:6  },
    { col:1,row:3,signIndex:7  },{ col:0,row:3,signIndex:8  },
    { col:0,row:2,signIndex:9  },{ col:0,row:1,signIndex:10 },
  ];

  const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
                 'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const lagnaIdx = houses[0].signIndex;

  const getPlanetsForSign = (si: number) =>
    Object.entries(planets)
      .filter(([n, p]) => n !== 'Ascendant' && p.signIndex === si)
      .map(([n]) => n);

  const houseForSign = (si: number) => houses.find(h => h.signIndex === si);

  return (
    <svg viewBox={`0 0 ${TOTAL} ${TOTAL}`} style={{ width:'100%', maxWidth:TOTAL }}
      role="img" aria-label="South Indian Kundali Chart">
      <BorderOrnament size={TOTAL} />
      <rect x={PAD} y={PAD} width={S} height={S} style={{ fill:'var(--chart-bg)' }} />

      {[1,2,3].map(i => (
        <g key={i}>
          <line x1={PAD+cellS*i} y1={PAD} x2={PAD+cellS*i} y2={PAD+S} style={{ stroke:'var(--chart-line)' }} strokeWidth={1.5} />
          <line x1={PAD} y1={PAD+cellS*i} x2={PAD+S} y2={PAD+cellS*i} style={{ stroke:'var(--chart-line)' }} strokeWidth={1.5} />
        </g>
      ))}
      <rect x={PAD} y={PAD} width={S} height={S} fill="none" style={{ stroke:'var(--chart-line)' }} strokeWidth={2} />

      {/* Center label */}
      <rect x={PAD+cellS} y={PAD+cellS} width={cellS*2} height={cellS*2} style={{ fill:'var(--chart-bg)' }} />
      <text x={PAD+S/2} y={PAD+S/2-8} textAnchor="middle" style={{ fill:'var(--chart-border-gold)' }} fontSize={11} fontFamily="Cinzel, serif">JyotishVeda</text>
      <text x={PAD+S/2} y={PAD+S/2+8} textAnchor="middle" style={{ fill:'var(--chart-text-sub)' }} fontSize={8} fontFamily="Inter, sans-serif">South Indian</text>

      {GRID.map(({ col, row, signIndex }) => {
        const cx = PAD + col * cellS, cy = PAD + row * cellS;
        const sign = SIGNS[signIndex];
        const houseData = houseForSign(signIndex);
        const ps = getPlanetsForSign(signIndex);
        const isLagna = signIndex === lagnaIdx;
        const isHov   = hoveredSign === signIndex;
        const mx = cx + cellS / 2;

        const planetsStartY = cy + 36 + (isLagna ? 4 : 0);

        return (
          <g key={signIndex}
            onMouseEnter={() => setHoveredSign(signIndex)}
            onMouseLeave={() => setHoveredSign(null)}>
            <rect x={cx+2} y={cy+2} width={cellS-4} height={cellS-4} rx={12}
              style={{
                fill: isLagna ? 'var(--chart-h1-fill)' : 'var(--chart-rounded-fill)',
                stroke: isLagna ? 'var(--chart-border-gold)' : 'var(--chart-line-inner)',
                strokeWidth: isLagna ? 2 : 1,
              }} />
            {isLagna && (
              <>
                <line x1={cx+4} y1={cy+4} x2={cx+20} y2={cy+4} style={{ stroke:'var(--chart-border-gold)' }} strokeWidth={3} strokeLinecap="round" />
                <line x1={cx+4} y1={cy+4} x2={cx+4} y2={cy+20} style={{ stroke:'var(--chart-border-gold)' }} strokeWidth={3} strokeLinecap="round" />
              </>
            )}
            {/* House number */}
            <text x={cx+cellS-6} y={cy+13} textAnchor="end"
              style={{ fill:'var(--chart-text-sub)' }} fontSize={7.5} fontFamily="Inter, sans-serif" opacity={0.7}>
              H{houseData?.number ?? ''}
            </text>
            {/* Sign symbol */}
            <text x={cx+7} y={cy+15} style={{ fill: isLagna ? 'var(--chart-border-gold)' : 'var(--chart-text)' }} fontSize={11} fontFamily="serif">
              {SIGN_SYM[sign] ?? ''}
            </text>
            {/* Sign abbrev */}
            <text x={cx+7} y={cy+26} style={{ fill:'var(--chart-text-sub)' }} fontSize={6.5} fontFamily="Inter, sans-serif">
              {sign.substring(0,3).toUpperCase()}
            </text>

            {/* Planet blocks */}
            <PlanetBlock
              planetNames={ps}
              chart={chart}
              cx={mx}
              startY={planetsStartY}
              big={false}
              selectedPlanet={selectedPlanet}
              onSelectPlanet={onSelectPlanet}
            />

            {isHov && (
              <g>
                <rect x={mx-60} y={cy-44} width={120} height={40} rx={5}
                  style={{ fill:'var(--chart-bg-cell)' }}
                  stroke="var(--chart-border-gold)" strokeWidth={0.8} opacity={0.97} />
                <text x={mx} y={cy-31} textAnchor="middle"
                  style={{ fill:'var(--chart-border-gold)' }}
                  fontSize={8} fontWeight="700" fontFamily="Cinzel, serif">
                  H{houseData?.number} · {sign}
                </text>
                <text x={mx} y={cy-18} textAnchor="middle"
                  style={{ fill:'var(--chart-text-sub)' }} fontSize={7} fontFamily="Inter, sans-serif">
                  {ps.length ? ps.map(p => PLANET_LABELS[p as keyof typeof PLANET_LABELS]?.english).join(', ') : 'Empty house'}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Planet Guide (beginner-friendly legend) ─────────────────────────────── */
const PLANET_ORDER = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];

function PlanetGuide({ chart, selectedPlanet, onSelectPlanet }: {
  chart: KundaliChart;
  selectedPlanet: string | null;
  onSelectPlanet: (p: string) => void;
}) {
  const { language, t, formatPlanet, formatSign, formatDignity } = useLanguage();

  return (
    <div className="card" style={{ marginTop:'1.25rem' }}>
      <div className="card-title mb-2" style={{ fontSize:'0.88rem' }}>{t('charts.planetGuide')}</div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.45rem', marginBottom:'0.75rem' }}>
        {PLANET_ORDER.map(p => {
          const meta = PLANET_LABELS[p as keyof typeof PLANET_LABELS];
          const pos  = chart.planets[p as keyof typeof chart.planets];
          if (!meta || !pos) return null;
          const isSelected = selectedPlanet === p;
          return (
            <button key={p}
              onClick={() => onSelectPlanet(isSelected ? '' : p)}
              style={{
                display:'flex', flexDirection:'column', alignItems:'center', gap:'0.1rem',
                padding:'0.4rem 0.7rem', borderRadius:'var(--radius-sm)', cursor:'pointer',
                background: isSelected ? `${PC[p]}22` : 'var(--surface-overlay)',
                border:`1.5px solid ${isSelected ? PC[p] : 'var(--border-subtle)'}`,
                transition:'all 0.15s',
              }}>
              <span style={{ fontSize:'1.25rem', lineHeight:1, color:PC[p] }}>{GLYPHS[p]}</span>
              <span style={{ fontSize:'0.72rem', fontWeight:600, color: isSelected ? PC[p] : 'var(--text-secondary)' }}>
                {formatPlanet(p)}
              </span>
              <span style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>
                {language === 'mr' ? `भा${pos.house}` : `H${pos.house}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected planet detail panel */}
      {selectedPlanet && (() => {
        const p    = selectedPlanet;
        const meta = PLANET_LABELS[p as keyof typeof PLANET_LABELS];
        const pos  = chart.planets[p as keyof typeof chart.planets];
        const analysis = chart.planetAnalysis?.[p as keyof typeof chart.planetAnalysis];
        if (!meta || !pos) return null;

        const deg  = pos.degreeInSign;
        const degD = Math.floor(deg), degM = Math.floor((deg - degD) * 60);
        const degStr = `${degD}°${String(degM).padStart(2,'0')}'`;

        return (
          <div style={{
            padding:'0.9rem 1.05rem', borderRadius:'var(--radius-sm)',
            background:`${PC[p]}11`, border:`1.5px solid ${PC[p]}44`,
            display:'grid', gridTemplateColumns:'auto 1fr', gap:'0.75rem 1.25rem',
            alignItems:'start',
          }}>
            {/* Big glyph */}
            <div style={{ fontSize:'2.8rem', lineHeight:1, color:PC[p], gridRow:'1/3' }}>
              {GLYPHS[p]}
            </div>
            {/* Name + sign */}
            <div>
              <div style={{ fontWeight:700, fontSize:'1.05rem', color:PC[p] }}>
                {formatPlanet(p)} <span style={{ fontSize:'0.82rem', fontWeight:500, color:'var(--text-muted)' }}>({meta.english} / {meta.sanskrit})</span>
              </div>
              <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)', marginTop:'0.2rem' }}>
                <b>{formatSign(pos.sign)}</b> · {t('common.house')} {pos.house} · {degStr}
                {pos.isRetrograde && <span className="badge badge-violet" style={{ marginLeft:'0.4rem', fontSize:'0.68rem' }}>℞ {t('common.retrograde')}</span>}
                {pos.isCombust    && <span className="badge badge-crimson" style={{ marginLeft:'0.3rem', fontSize:'0.68rem' }}>☄ {t('common.combust')}</span>}
              </div>
            </div>
            {/* Detail grid */}
            <div style={{ gridColumn:'2', display:'flex', flexWrap:'wrap', gap:'0.6rem', fontSize:'0.78rem' }}>
              {[
                { label: t('common.nakshatra'), value:`${pos.nakshatra?.name ?? '—'} (${t('common.pada')} ${pos.nakshatraPosition?.pada ?? '—'})` },
                { label: t('common.dignity'),   value: formatDignity(pos.dignity) },
                { label: t('common.strength'),  value: analysis?.strengthLevel ?? '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ background:'var(--surface-overlay)', borderRadius:'var(--radius-xs)', padding:'0.3rem 0.65rem' }}>
                  <div style={{ color:'var(--text-muted)', fontSize:'0.68rem' }}>{label}</div>
                  <div style={{ color:'var(--text-primary)', fontWeight:600 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      <p className="text-xs text-muted mt-3">
        {t('charts.legend')}
      </p>
    </div>
  );
}

/* ─── Main export ─────────────────────────────────────────────────────────── */
export default function KundaliCharts({ chart }: Props) {
  const { language, t, formatPlanet, formatSign, formatDignity } = useLanguage();
  const [style,          setStyle]          = useState<'north'|'south'>('north');
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);

  function handleSelectPlanet(p: string) {
    setSelectedPlanet(p === selectedPlanet ? null : p || null);
  }

  // Calculate snapshot metrics
  const PLANETS_BODY: Planet[] = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
  const strongPlanets = PLANETS_BODY.filter(p => chart.planetAnalysis?.[p]?.strengthLevel === 'Strong');
  const weakPlanets   = PLANETS_BODY.filter(p => chart.planetAnalysis?.[p]?.strengthLevel === 'Weak');
  const rajYogasCount = chart.yogas.filter(y => ['RajaYoga','Mahapurusha','DhanaYoga'].includes(y.category)).length;

  const topStrongPlanet = strongPlanets[0] || null;
  const topWeakPlanet   = weakPlanets[0] || null;

  return (
    <div className="fade-in">
      <div className="grid-chart-workspace">
        {/* ─── LEFT COLUMN: Chart & Style Controls ────────────────────────── */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          {/* Controls Bar */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.75rem' }}>
            <div style={{ display:'flex', gap:'0.5rem' }}>
              <button
                className={`btn ${style === 'north' ? 'btn-secondary' : 'btn-ghost'}`}
                style={{ fontSize:'0.82rem', padding:'0.35rem 0.85rem' }}
                aria-pressed={style === 'north'}
                onClick={() => setStyle('north')}
              >
                🏛 {t('common.northIndian')}
              </button>
              <button
                className={`btn ${style === 'south' ? 'btn-secondary' : 'btn-ghost'}`}
                style={{ fontSize:'0.82rem', padding:'0.35rem 0.85rem' }}
                aria-pressed={style === 'south'}
                onClick={() => setStyle('south')}
              >
                🏛 {t('common.southIndian')}
              </button>
            </div>
            <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
              {language === 'mr' ? 'ग्रह पाहण्यासाठी त्यावर क्लिक करा' : 'Click any planet to inspect'}
            </span>
          </div>

          {/* Large Birth Chart Container */}
          <div className="card card-hero" style={{ padding:'1.5rem 1rem', display:'flex', justifyContent:'center', alignItems:'center' }}>
            <div className="chart-wrapper" style={{ width:'100%', maxWidth:580, margin:'0 auto' }}>
              {style === 'north'
                ? <NorthIndianChart chart={chart} selectedPlanet={selectedPlanet} onSelectPlanet={handleSelectPlanet} />
                : <SouthIndianChart chart={chart} selectedPlanet={selectedPlanet} onSelectPlanet={handleSelectPlanet} />
              }
            </div>
          </div>

          {/* Planet Guide Underneath */}
          <PlanetGuide chart={chart} selectedPlanet={selectedPlanet} onSelectPlanet={handleSelectPlanet} />
        </div>

        {/* ─── RIGHT COLUMN: Chart Snapshot & Real-Time Inspector ─────────── */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          {/* Chart Snapshot Card */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">✨ {language === 'mr' ? 'कुंडली सारांश' : 'Chart Snapshot'}</span>
              <span className="badge badge-gold">{formatSign(chart.lagnaSign)} Lagna</span>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', fontSize:'0.84rem' }}>
              {/* Lagna */}
              <div className="info-row">
                <span className="label">🌅 {t('overview.natalLagna')}</span>
                <span className="value font-bold text-gold">
                  {formatSign(chart.lagnaSign)} <span style={{ fontSize:'0.72rem', fontWeight:400, color:'var(--text-muted)' }}>({formatPlanet(chart.lagnaLord)})</span>
                </span>
              </div>

              {/* Moon Sign */}
              <div className="info-row">
                <span className="label">🌙 {t('overview.moonSign')}</span>
                <span className="value font-bold" style={{ color:'#7b9fd4' }}>
                  {formatSign(chart.moonSign)}
                </span>
              </div>

              {/* Sun Sign */}
              <div className="info-row">
                <span className="label">☀️ {t('overview.sunSign')}</span>
                <span className="value font-bold" style={{ color:'#e07b39' }}>
                  {formatSign(chart.sunSign)}
                </span>
              </div>

              {/* Birth Nakshatra */}
              <div className="info-row">
                <span className="label">✨ {t('overview.nakshatraPada')}</span>
                <span className="value">
                  <b>{chart.janmaNakshatra.name}</b> · Pada {chart.janmaNakshatraPada}
                </span>
              </div>

              <div className="divider" style={{ margin:'0.35rem 0' }} />

              {/* Strongest Planet */}
              <div className="info-row">
                <span className="label">💪 {language === 'mr' ? 'सर्वात बलवान ग्रह' : 'Strongest Planet'}</span>
                <span className="value">
                  {topStrongPlanet ? (
                    <span className="badge badge-teal">
                      {GLYPHS[topStrongPlanet]} {formatPlanet(topStrongPlanet)}
                    </span>
                  ) : '—'}
                </span>
              </div>

              {/* Challenged Planet */}
              <div className="info-row">
                <span className="label">⚡ {language === 'mr' ? 'आव्हानात्मक ग्रह' : 'Challenged Planet'}</span>
                <span className="value">
                  {topWeakPlanet ? (
                    <span className="badge badge-crimson">
                      {GLYPHS[topWeakPlanet]} {formatPlanet(topWeakPlanet)}
                    </span>
                  ) : (language === 'mr' ? 'सर्व ग्रह संतुलित' : 'Well balanced')}
                </span>
              </div>

              {/* Raj Yoga Count */}
              <div className="info-row">
                <span className="label">🌟 {language === 'mr' ? 'प्रमुख राजयोग' : 'Important Yogas'}</span>
                <span className="value font-bold text-gold">
                  {rajYogasCount} {language === 'mr' ? 'योग' : 'detected'}
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Planet Inspector Card */}
          <div className="card" style={{
            background: selectedPlanet ? `${PC[selectedPlanet]}0d` : 'var(--surface-raised)',
            borderColor: selectedPlanet ? `${PC[selectedPlanet]}55` : 'var(--border-subtle)',
            transition: 'all 0.2s ease',
          }}>
            <div className="card-header">
              <span className="card-title">
                🔍 {language === 'mr' ? 'ग्रह सूक्ष्म परीक्षण' : 'Planet Inspector'}
              </span>
              {selectedPlanet && (
                <button className="btn btn-ghost" style={{ fontSize:'0.7rem', padding:'0.15rem 0.45rem' }} onClick={() => setSelectedPlanet(null)}>
                  ✕ Reset
                </button>
              )}
            </div>

            {selectedPlanet ? (() => {
              const p = selectedPlanet;
              const meta = PLANET_LABELS[p as keyof typeof PLANET_LABELS];
              const pos  = chart.planets[p as keyof typeof chart.planets];
              const analysis = chart.planetAnalysis?.[p as keyof typeof chart.planetAnalysis];
              if (!meta || !pos) return null;

              return (
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.85rem', marginBottom:'1rem' }}>
                    <div style={{
                      width:52, height:52, borderRadius:'50%',
                      background:`${PC[p]}20`, border:`2px solid ${PC[p]}`,
                      display:'grid', placeItems:'center', fontSize:'1.75rem', color:PC[p],
                      boxShadow:`0 0 16px ${PC[p]}33`,
                    }}>
                      {GLYPHS[p]}
                    </div>
                    <div>
                      <div style={{ fontSize:'1.15rem', fontWeight:800, color:PC[p] }}>
                        {formatPlanet(p)} <span style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:500 }}>({meta.english} / {meta.sanskrit})</span>
                      </div>
                      <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)', marginTop:'0.15rem' }}>
                        <b>{formatSign(pos.sign)}</b> · {t('common.house')} {pos.house} · {pos.dmsString}
                      </div>
                    </div>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem', fontSize:'0.8rem' }}>
                    <div style={{ background:'var(--surface-overlay)', padding:'0.5rem 0.7rem', borderRadius:'var(--radius-sm)' }}>
                      <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>{t('common.dignity')}</div>
                      <div style={{ fontWeight:700, color:'var(--brand-400)', marginTop:'0.1rem' }}>
                        {formatDignity(pos.dignity)}
                      </div>
                    </div>
                    <div style={{ background:'var(--surface-overlay)', padding:'0.5rem 0.7rem', borderRadius:'var(--radius-sm)' }}>
                      <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>{t('common.strength')}</div>
                      <div style={{ fontWeight:700, color:'var(--text-primary)', marginTop:'0.1rem' }}>
                        {analysis?.strengthLevel || '—'}
                      </div>
                    </div>
                    <div style={{ background:'var(--surface-overlay)', padding:'0.5rem 0.7rem', borderRadius:'var(--radius-sm)' }}>
                      <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>{t('common.nakshatra')}</div>
                      <div style={{ fontWeight:600, color:'var(--text-primary)', marginTop:'0.1rem' }}>
                        {pos.nakshatra?.name} (P{pos.nakshatraPosition?.pada})
                      </div>
                    </div>
                    <div style={{ background:'var(--surface-overlay)', padding:'0.5rem 0.7rem', borderRadius:'var(--radius-sm)' }}>
                      <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>{language === 'mr' ? 'गती / अवस्था' : 'Motion'}</div>
                      <div style={{ fontWeight:600, color:'var(--text-primary)', marginTop:'0.1rem' }}>
                        {pos.isRetrograde ? '℞ Retrograde' : 'Direct'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div style={{ textAlign:'center', padding:'1.5rem 1rem', color:'var(--text-muted)', fontSize:'0.83rem' }}>
                <div style={{ fontSize:'1.6rem', marginBottom:'0.5rem' }}>👆</div>
                <p style={{ margin:0, lineHeight:1.5 }}>
                  {language === 'mr'
                    ? 'कुंडलीतील कोणत्याही ग्रहावर किंवा खालील चिन्हांवर क्लिक करून त्याचे सविस्तर विश्लेषण पहा.'
                    : 'Click any planet in the Kundali chart or guide below to inspect its detailed metrics.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
