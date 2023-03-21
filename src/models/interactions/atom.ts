import { atom, useRecoilState } from 'recoil';
import { InteractionData } from './types';

export const interactionsAtom = atom<InteractionData | undefined>({
  key: 'interactionsAtom',
  default: undefined,
});

export const useChartInteractionsAtom = () => {
  return useRecoilState(interactionsAtom);
};

export default interactionsAtom;
