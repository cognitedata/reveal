import React from 'react';

import { AppContext, AppContextProps } from '@data-exploration-lib/core';

export const AppContextProvider = ({
  children,
  flow,
  overrideURLMap,
  userInfo,
  isAdvancedFiltersEnabled,
  trackUsage,
  isDocumentsApiEnabled,
}: AppContextProps & { children: any }) => {
  return (
    <AppContext.Provider
      value={{
        flow,
        overrideURLMap,
        userInfo,
        isAdvancedFiltersEnabled,
        trackUsage,
        isDocumentsApiEnabled,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};