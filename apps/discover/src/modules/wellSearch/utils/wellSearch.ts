import { CogniteError } from '@cognite/sdk-core';

import { log } from '_helpers/log';
import { showWarningMessage } from 'components/toast';

import { WELL_SEARCH_ACCESS_ERROR } from '../constants';

export const handleWellSearchError = (error: CogniteError) => {
  log('error', [error && error.message], 3);

  if (error.status === 403) {
    showWarningMessage(WELL_SEARCH_ACCESS_ERROR);
  }
};
