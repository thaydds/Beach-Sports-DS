import { createContext } from 'react';

export type RankingDensity = 'compact' | 'comfortable';
export const RankingDensityContext = createContext<RankingDensity>('compact');
export const RankingLabelsContext = createContext({
  position: 'Posição',
  player: 'Jogador',
  points: 'Pontos',
});
