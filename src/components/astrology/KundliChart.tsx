import React from 'react';

interface PlanetInfo {
  name: string;
  degree?: number;
}

interface KundliChartProps {
  houses: Array<{
    houseNumber?: number; // 1 to 12
    rashi?: number; // 0 to 11 (0=Aries, etc.)
    planets: PlanetInfo[] | string[];
  }>;
  width?: number;
  height?: number;
  chartStyle?: 'north' | 'south';
  interactive?: boolean;
}

const rashiNames = ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi'];

export default function KundliChart({ houses, width = 400, height = 400, chartStyle = 'north', interactive = false }: KundliChartProps) {
  const s = width;
  const s2 = s / 2;
  const s4 = s / 4;

  const getPlanetString = (p: PlanetInfo | string) => {
    if (typeof p === 'string') {
      return p.substring(0, 2).toUpperCase();
    }
    const name = p.name.substring(0, 2).toUpperCase();
    if (p.degree !== undefined) {
      const degInt = Math.floor(p.degree);
      return `${name} ${degInt}°`;
    }
    return name;
  };

  const renderNorthIndian = () => {
    const centers = [
      { x: s2, y: s4 },          // H1
      { x: s4, y: s / 8 },       // H2
      { x: s / 8, y: s4 },       // H3
      { x: s4, y: s2 },          // H4
      { x: s / 8, y: s * 3 / 4 }, // H5
      { x: s4, y: s * 7 / 8 },   // H6
      { x: s2, y: s * 3 / 4 },   // H7
      { x: s * 3 / 4, y: s * 7 / 8 }, // H8
      { x: s * 7 / 8, y: s * 3 / 4 }, // H9
      { x: s * 3 / 4, y: s2 },   // H10
      { x: s * 7 / 8, y: s4 },   // H11
      { x: s * 3 / 4, y: s / 8 }, // H12
    ];

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ borderRadius: '12px', cursor: interactive ? 'pointer' : 'default', display: 'block', width: '100%', height: 'auto' }}>
        <rect x="0" y="0" width={width} height={height} fill="#fffbf0" rx="12" ry="12" />
        <rect x="1" y="1" width={width - 2} height={height - 2} fill="none" stroke="#e65100" strokeWidth="2" rx="12" ry="12" />
        <line x1="0" y1="0" x2={width} y2={height} stroke="#e65100" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1={width} y1="0" x2="0" y2={height} stroke="#e65100" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1={s2} y1="0" x2="0" y2={s2} stroke="#e65100" strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1="0" y1={s2} x2={s2} y2={height} stroke="#e65100" strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1={s2} y1={height} x2={width} y2={s2} stroke="#e65100" strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1={width} y1={s2} x2={s2} y2="0" stroke="#e65100" strokeWidth="1.5" strokeOpacity="0.6" />

        {houses.map((house, index) => {
          const hCenter = centers[index];
          if (!hCenter) return null;
          
          const rashiNum = house.rashi !== undefined ? house.rashi + 1 : index + 1;
          const rashiLabel = house.rashi !== undefined ? rashiNames[house.rashi] : rashiNames[index];
          
          return (
            <g key={`north-${index}`}>
              <text x={hCenter.x} y={hCenter.y - 14} fontSize={width > 300 ? "12" : "10"} fill="#e65100" textAnchor="middle" fontWeight="800" fontFamily="Inter, sans-serif">
                {rashiNum} {rashiLabel}
              </text>
              <text x={hCenter.x} y={hCenter.y + 4} fontSize={width > 300 ? "10" : "8"} fill="#1a1a2e" textAnchor="middle" fontWeight="600" fontFamily="Inter, sans-serif">
                {house.planets.map((p, i) => (
                  <tspan x={hCenter.x} dy={i === 0 ? 0 : 12} key={i}>
                    {getPlanetString(p)}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderSouthIndian = () => {
    const cw = s / 4;
    const ch = height / 4;
    
    // Rashi index to grid position (col, row)
    const rashiPositions = [
      { c: 1, r: 0 }, { c: 2, r: 0 }, { c: 3, r: 0 }, { c: 3, r: 1 },
      { c: 3, r: 2 }, { c: 3, r: 3 }, { c: 2, r: 3 }, { c: 1, r: 3 },
      { c: 0, r: 3 }, { c: 0, r: 2 }, { c: 0, r: 1 }, { c: 0, r: 0 }
    ];

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ borderRadius: '12px', cursor: interactive ? 'pointer' : 'default', display: 'block', width: '100%', height: 'auto' }}>
        <rect x="0" y="0" width={width} height={height} fill="#fffbf0" rx="12" ry="12" />
        <rect x="1" y="1" width={width - 2} height={height - 2} fill="none" stroke="#e65100" strokeWidth="2" rx="12" ry="12" />
        
        {/* Draw South Indian Grid */}
        <line x1={cw} y1="0" x2={cw} y2={height} stroke="#e65100" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1={cw*2} y1="0" x2={cw*2} y2={ch} stroke="#e65100" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1={cw*2} y1={ch*3} x2={cw*2} y2={height} stroke="#e65100" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1={cw*3} y1="0" x2={cw*3} y2={height} stroke="#e65100" strokeWidth="1.5" strokeOpacity="0.4" />

        <line x1="0" y1={ch} x2={width} y2={ch} stroke="#e65100" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1="0" y1={ch*2} x2={cw} y2={ch*2} stroke="#e65100" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1={cw*3} y1={ch*2} x2={width} y2={ch*2} stroke="#e65100" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1="0" y1={ch*3} x2={width} y2={ch*3} stroke="#e65100" strokeWidth="1.5" strokeOpacity="0.4" />

        {/* Central crossed lines optional but standard */}
        <line x1={cw} y1={ch} x2={cw*3} y2={ch*3} stroke="#e65100" strokeWidth="1.5" strokeOpacity="0.2" />
        <line x1={cw*3} y1={ch} x2={cw} y2={ch*3} stroke="#e65100" strokeWidth="1.5" strokeOpacity="0.2" />

        {houses.map((house, index) => {
          const rashi = house.rashi !== undefined ? house.rashi : index;
          const pos = rashiPositions[rashi];
          if (!pos) return null;
          
          const centerX = pos.c * cw + cw / 2;
          const centerY = pos.r * ch + ch / 2;

          return (
            <g key={`south-${index}`}>
              <text x={pos.c * cw + 6} y={pos.r * ch + 16} fontSize={width > 300 ? "11" : "9"} fill="#e65100" fontWeight="800" fontFamily="Inter, sans-serif">
                {rashiNames[rashi]}
              </text>
              {index === 0 && (
                <text x={pos.c * cw + cw - 6} y={pos.r * ch + 16} fontSize={width > 300 ? "11" : "9"} fill="#d32f2f" textAnchor="end" fontWeight="800" fontFamily="Inter, sans-serif">
                  Asc
                </text>
              )}
              <text x={centerX} y={centerY + 2} fontSize={width > 300 ? "10" : "8"} fill="#1a1a2e" textAnchor="middle" fontWeight="600" fontFamily="Inter, sans-serif">
                {house.planets.map((p, i) => (
                  <tspan x={centerX} dy={i === 0 ? 0 : 12} key={i}>
                    {getPlanetString(p)}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return chartStyle === 'south' ? renderSouthIndian() : renderNorthIndian();
}

