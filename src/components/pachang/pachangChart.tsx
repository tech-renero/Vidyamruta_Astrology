import React from 'react';

// Types based on your API response
interface PlanetaryPosition {
    rashi: number;
    rashiName: string;
    isRetrograde: boolean;
    degree: number;
}

interface ChartProps {
    planetaryPositions?: Record<string, PlanetaryPosition>;
    udayaLagna?: number; // Ascendant degree
}

export default function SouthIndianChart({ planetaryPositions, udayaLagna }: ChartProps) {
    // 1. Map lagna degree (0-360) to the 12 Zodiac signs (0-11)
    const lagnaRashi = udayaLagna !== undefined ? Math.floor(udayaLagna / 30) : -1;

    // 2. Initialize the 12 houses (0 = Aries, 11 = Pisces)
    const houses: Record<number, string[]> = {};
    for (let i = 0; i < 12; i++) houses[i] = [];

    // 3. Place Ascendant (Lagna)
    if (lagnaRashi >= 0) houses[lagnaRashi].push('Asc');

    // 4. Place all Planets
    const abbr: Record<string, string> = {
        sun: 'Su', moon: 'Mo', mars: 'Ma', mercury: 'Me',
        jupiter: 'Ju', venus: 'Ve', saturn: 'Sa', rahu: 'Ra', ketu: 'Ke'
    };

    if (planetaryPositions) {
        Object.entries(planetaryPositions).forEach(([planet, data]) => {
            const symbol = abbr[planet] || planet.substring(0, 2);
            // Optional: Add (R) for retrograde planets (except nodes which are always retrograde)
            const retro = data.isRetrograde && planet !== 'rahu' && planet !== 'ketu' ? '(R)' : '';
            houses[data.rashi].push(`${symbol}${retro}`);
        });
    }

    // 5. The fixed South Indian Grid Layout
    // Using an array of 13 items. The "Center" item spans 2 rows and 2 columns.
    const gridCells = [
        { id: 11, label: 'Pi' }, { id: 0, label: 'Ar' }, { id: 1, label: 'Ta' }, { id: 2, label: 'Ge' },
        { id: 10, label: 'Aq' }, { isCenter: true }, { id: 3, label: 'Ca' },
        { id: 9, label: 'Cp' }, { id: 4, label: 'Le' },
        { id: 8, label: 'Sg' }, { id: 7, label: 'Sc' }, { id: 6, label: 'Li' }, { id: 5, label: 'Vi' }
    ];

    return (
        <div className="w-full max-w-sm mx-auto aspect-square p-2 bg-white rounded-xl shadow-sm border border-gray-100">

            {/* The Grid Container: 
        bg-orange-200 with gap-[1px] creates perfectly crisp 1px borders 
        without the overlapping border issues common in tables.
      */}
            <div className="grid grid-cols-4 grid-rows-4 w-full h-full bg-orange-200 gap-[1px] border border-orange-200 rounded-sm overflow-hidden">

                {gridCells.map((cell, idx) => {
                    // Render the merged Center square
                    if (cell.isCenter) {
                        return (
                            <div key="center" className="col-span-2 row-span-2 bg-white flex flex-col items-center justify-center p-2 text-center">
                                <h3 className="font-bold text-lg" style={{ color: 'var(--primary)' }}>Rasi Chakra</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">South Indian</p>
                            </div>
                        );
                    }

                    const planetsInHouse = houses[cell.id as number] || [];
                    const isLagna = cell.id === lagnaRashi;

                    return (
                        <div
                            key={cell.id}
                            className={`relative bg-white p-1.5 flex flex-wrap content-center justify-center gap-1.5 transition-colors ${isLagna ? 'bg-orange-50/50' : ''}`}
                        >
                            {/* Faint Zodiac Abbreviation in the corner */}
                            <span className="absolute top-1 left-1.5 text-[9px] font-bold text-gray-300 uppercase select-none">
                                {cell.label}
                            </span>

                            {/* Planets */}
                            {planetsInHouse.map((p, i) => (
                                <span
                                    key={i}
                                    className={`text-xs font-bold px-1.5 py-0.5 rounded-sm shadow-sm ${p === 'Asc'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}
                                >
                                    {p}
                                </span>
                            ))}
                        </div>
                    );
                })}

            </div>
        </div>
    );
}