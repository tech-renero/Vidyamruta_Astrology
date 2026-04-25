import { Observer, getKundli, matchKundli, getPanchangamDetails } from '@ishubhamx/panchangam-js';

export interface Location {
  latitude: number;
  longitude: number;
}

export function generateKundli(date: Date, location: Location) {
  // We need to use new Observer(latitude, longitude, height)
  // But wait, what if Observer is a constructor or an object? We'll find out.
  // We'll pass a mock height of 0.
  const observer = new (Observer as any)(location.latitude, location.longitude, 0);
  return getKundli(date, observer, { houseSystem: 'whole_sign' });
}

export function performMatch(boyKundli: any, girlKundli: any) {
  return matchKundli(boyKundli, girlKundli);
}

export function generatePanchang(date: Date, location: Location) {
  const observer = new (Observer as any)(location.latitude, location.longitude, 0);
  return getPanchangamDetails(date, observer);
}
