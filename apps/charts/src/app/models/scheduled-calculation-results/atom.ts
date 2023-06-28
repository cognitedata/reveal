import { atom, useRecoilState, useRecoilValue } from 'recoil';

import { ScheduledCalculationsDataMap } from './types';

export const scheduledCalculationDataAtom = atom<ScheduledCalculationsDataMap>({
  key: 'scheduledCalculationAtom',
  default: {},
});

export const useScheduledCalculationData = () =>
  useRecoilState(scheduledCalculationDataAtom);

export const useScheduledCalculationDataValue = () =>
  useRecoilValue(scheduledCalculationDataAtom);
