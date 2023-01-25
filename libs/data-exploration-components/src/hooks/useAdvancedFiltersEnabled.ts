import * as React from 'react';
import { AppContext } from '@data-exploration-components/context/AppContext';

export const useAdvancedFiltersEnabled = () => {
  const context = React.useContext(AppContext);

  return !!context?.isAdvancedFiltersEnabled;
};
