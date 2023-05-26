import * as React from 'react';

import { AppContext } from '@data-exploration-lib/core';

export const useAdvancedFiltersEnabled = () => {
  const context = React.useContext(AppContext);

  return !!context?.isAdvancedFiltersEnabled;
};
