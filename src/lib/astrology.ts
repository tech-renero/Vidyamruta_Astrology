/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
import { Observer, getKundli, matchKundli, getPanchangamDetails } from '@ishubhamx/panchangam-js';

export interface Location {
  latitude: number;
  longitude: number;
}

export function generateKundli(date: Date, location: Location) {
  // We need to use new Observer(latitude, longitude, height)
  // But wait, what if Observer is a constructor or an object? We'll find out.
  // We'll pass a mock height of 0.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const observer = new (Observer as any)(location.latitude, location.longitude, 0);
  return getKundli(date, observer, { houseSystem: 'whole_sign' });
}

export function performMatch(boyKundli: Record<string, unknown>, girlKundli: Record<string, unknown>) {
  return matchKundli(boyKundli as any, girlKundli as any);
}

export function generatePanchang(date: Date, location: Location) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const observer = new (Observer as any)(location.latitude, location.longitude, 0);
  return getPanchangamDetails(date, observer);
}
