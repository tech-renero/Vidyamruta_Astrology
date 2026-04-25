import React from 'react';

interface KundliChartProps {
  houses: Array<{
    houseNumber?: number; // 1 to 12
    rashi?: number; // 0 to 11 (0=Aries, etc.)
    planets: string[];
  }>;
  width?: number;
  height?: number;
}

const rashiNames = ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi'];

export default function KundliChart({ houses, width = 400, height = 400 }: KundliChartProps) {
  const s = width;
  const s2 = s / 2;
  const s4 = s / 4;

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
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ borderRadius: '12px' }}>
      {/* Background */}
      <rect x="0" y="0" width={width} height={height} fill="#fffbf0" rx="12" ry="12" />
      
      {/* Outer Border */}
      <rect x="1" y="1" width={width - 2} height={height - 2} fill="none" stroke="#e65100" strokeWidth="2" rx="12" ry="12" />
      
      {/* Diagonals */}
      <line x1="0" y1="0" x2={width} y2={height} stroke="#e65100" strokeWidth="1.5" strokeOpacity="0.4" />
      <line x1={width} y1="0" x2="0" y2={height} stroke="#e65100" strokeWidth="1.5" strokeOpacity="0.4" />
      
      {/* Inscribed Diamond */}
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
          <g key={index}>
            {/* Rashi Number */}
            <text 
              x={hCenter.x} 
              y={hCenter.y - 14} 
              fontSize={width > 300 ? "12" : "10"} 
              fill="#e65100" 
              textAnchor="middle"
              fontWeight="800"
              fontFamily="Inter, sans-serif"
            >
              {rashiNum} {rashiLabel}
            </text>
            
            {/* Planets */}
            <text
              x={hCenter.x}
              y={hCenter.y + 8}
              fontSize={width > 300 ? "11" : "9"}
              fill="#1a1a2e"
              textAnchor="middle"
              fontWeight="600"
              fontFamily="Inter, sans-serif"
            >
              {house.planets.map(p => p.substring(0, 2).toUpperCase()).join(', ')}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
