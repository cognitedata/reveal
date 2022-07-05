import { useMemo } from 'react';

import { useDataPanelState } from './useDataPanelContext';

export const useCheckedDataElementsState = () => {
  const { checkedDataElements } = useDataPanelState();

  const state = useMemo(
    () => checkedDataElements[0]?.state,
    [checkedDataElements]
  );
  return state;
};
