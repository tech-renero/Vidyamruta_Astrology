import { UserDetails, MatchResult } from '@/types/astrology';
import { getKundliForDetails } from './kundli.service';
import { performMatch } from '@/lib/astrology';

export async function getMatchForDetails(boy: UserDetails, girl: UserDetails): Promise<MatchResult> {
  const boyKundli = await getKundliForDetails(boy);
  const girlKundli = await getKundliForDetails(girl);

  return performMatch(boyKundli, girlKundli);
}
