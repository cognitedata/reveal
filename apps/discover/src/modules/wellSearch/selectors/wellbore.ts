import pickBy from 'lodash/pickBy';

import useSelector from 'hooks/useSelector';

import { wellboreDataSelector } from './wellboreSelectors';

export const useSelectedWellboreIds = () => {
  return useSelector((state) => {
    const { selectedWellboreIds } = state.wellSearch;
    return Object.keys(pickBy(selectedWellboreIds));
  });
};

// This returns wellbore data
export const useWellboreData = () => {
  return useSelector(wellboreDataSelector);
};
