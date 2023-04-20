import { AppContext, AppContextProps } from '@data-exploration-lib/core';
import React from 'react';

export const AppContextProvider = ({
  children,
  flow,
  overrideURLMap,
  userInfo,
  isAdvancedFiltersEnabled,
  trackUsage,
}: AppContextProps & { children: any }) => {
  return (
    <AppContext.Provider
      value={{
        flow,
        overrideURLMap,
        userInfo,
        isAdvancedFiltersEnabled,
        trackUsage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
