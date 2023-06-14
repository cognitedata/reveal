import { useSearchParams } from 'react-router-dom';

import { SELECTED_TAB_FIELD } from '@data-exploration-lib/core';

// Get and set selected tab for details overlay
export const useResourceDetailSelectedTab = (): [
  string | null,
  (tabKey: string) => void
] => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTab = searchParams.get(SELECTED_TAB_FIELD);

  const setSelectedTab = (detailSelectedTabKey: string) => {
    setSearchParams((params) => {
      params.set(SELECTED_TAB_FIELD, detailSelectedTabKey);
      return params;
    });
  };

  return [selectedTab, setSelectedTab];
};
