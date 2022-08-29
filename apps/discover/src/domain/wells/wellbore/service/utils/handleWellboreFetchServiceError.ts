import { handleServiceError } from 'utils/errors';

import { CogniteError } from '@cognite/sdk-core';

import { showWarningMessage } from 'components/Toast';
import { WELL_SEARCH_ACCESS_ERROR } from 'modules/wellSearch/constants';

export const handleWellboreFetchServiceError = (error: CogniteError) => {
  handleServiceError(error, undefined, error.message);

  if (error.status === 403) {
    showWarningMessage(WELL_SEARCH_ACCESS_ERROR);
  }
};
