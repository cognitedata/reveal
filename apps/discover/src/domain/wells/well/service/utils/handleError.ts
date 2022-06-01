import { log } from 'utils/log';

import { CogniteError } from '@cognite/sdk-core';

import { showWarningMessage } from 'components/Toast';
import { WELL_SEARCH_ACCESS_ERROR } from 'modules/wellSearch/constants';

export const handleError = (error: CogniteError) => {
  log('error', [error && error.message], 3);

  if (error.status === 403) {
    showWarningMessage(WELL_SEARCH_ACCESS_ERROR);
  }
};
