import * as React from 'react';

import { AppContext } from '@data-exploration-lib/core';

export const useIsDocumentsApiEnabled = () => {
  const context = React.useContext(AppContext);

  return context?.isDocumentsApiEnabled;
};
