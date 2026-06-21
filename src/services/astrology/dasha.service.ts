import { MoonDetails, DashaData, DashaPeriod, Antardasha } from '@/types/astrology';

const planetYears: Record<string, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17
};

export function computeDashaData(moonDetails: MoonDetails, birthDate: Date): DashaData {
  const fixedOrder = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  const startIdx = fixedOrder.indexOf(moonDetails.nakshatraLord);

  if (startIdx === -1) {
    throw new Error(`Invalid nakshatraLord: ${moonDetails.nakshatraLord}`);
  }

  const fullCycle: DashaPeriod[] = [];
  let curDate = new Date(birthDate);

  // Vimshottari dasha periods calculated using 360-day years
  const dashaBalanceMs = moonDetails.dashaBalance * 360 * 24 * 60 * 60 * 1000;
  const firstEnd = new Date(curDate.getTime() + dashaBalanceMs);

  fullCycle.push({
    planet: moonDetails.nakshatraLord,
    startTime: new Date(curDate),
    endTime: firstEnd
  });

  curDate = firstEnd;

  for (let i = 1; i < 9; i++) {
    const planet = fixedOrder[(startIdx + i) % 9];
    const yrs = planetYears[planet];
    const periodMs = yrs * 360 * 24 * 60 * 60 * 1000;
    const endDate = new Date(curDate.getTime() + periodMs);

    fullCycle.push({
      planet,
      startTime: new Date(curDate),
      endTime: endDate
    });
    curDate = endDate;
  }

  return {
    birthNakshatra: moonDetails.nakshatra,
    nakshatraPada: moonDetails.pada,
    dashaBalance: `${moonDetails.nakshatraLord}: ${moonDetails.dashaBalance.toFixed(2)}y`,
    fullCycle,
  };
}

export function getAntardashas(mahaPlanet: string, startDate: Date): Antardasha[] {
  const sequence = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  const mahaYears = planetYears[mahaPlanet];

  if (!mahaYears) return [];

  const startIndex = sequence.indexOf(mahaPlanet);
  let currentStart = new Date(startDate);
  const antardashas: Antardasha[] = [];

  for (let i = 0; i < 9; i++) {
    const antarPlanet = sequence[(startIndex + i) % 9];
    const antarYears = planetYears[antarPlanet];

    // Use 360 days to match mahadasha logic
    const durationDays = (mahaYears * antarYears / 120) * 360;
    const endTime = new Date(currentStart.getTime() + durationDays * 24 * 60 * 60 * 1000);

    antardashas.push({
      planet: antarPlanet,
      startTime: new Date(currentStart),
      endTime: new Date(endTime)
    });

    currentStart = endTime;
  }

  return antardashas;
}

export function getActualCurrentMahadasha(dashaData: DashaData & { currentMahadasha?: DashaPeriod }): DashaPeriod | null {
  if (!dashaData?.fullCycle) return dashaData?.currentMahadasha || null;

  const now = new Date();

  for (const period of dashaData.fullCycle) {
    if (new Date(period.startTime).getTime() <= now.getTime() && now.getTime() <= new Date(period.endTime).getTime()) {
      return {
        planet: period.planet,
        startTime: period.startTime,
        endTime: period.endTime
      };
    }
  }

  return dashaData?.currentMahadasha || null;
}

export function getDashaLordDetails(dashaData: DashaData, targetDate: Date | string): { mahadasha: DashaPeriod | null, antardasha: Antardasha | null } {
  let mahadasha: DashaPeriod | null = null;
  let antardasha: Antardasha | null = null;
  const tTime = new Date(targetDate).getTime();

  if (dashaData.fullCycle) {
    for (const period of dashaData.fullCycle) {
      if (new Date(period.startTime).getTime() <= tTime && tTime <= new Date(period.endTime).getTime()) {
        mahadasha = period;
        break;
      }
    }
  }

  if (mahadasha) {
    const antardashas = getAntardashas(mahadasha.planet, mahadasha.startTime);
    for (const antar of antardashas) {
      if (new Date(antar.startTime).getTime() <= tTime && tTime <= new Date(antar.endTime).getTime()) {
        antardasha = antar;
        break;
      }
    }
  }

  return { mahadasha, antardasha };
}

export type DashaStatus = 'Completed' | 'Active' | 'Upcoming';

export function getDashaStatus(startTime: Date | string, endTime: Date | string, targetDate: Date | string = new Date()): DashaStatus {
  const tTime = new Date(targetDate).getTime();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (tTime < start) return 'Upcoming';
  if (tTime > end) return 'Completed';
  return 'Active';
}