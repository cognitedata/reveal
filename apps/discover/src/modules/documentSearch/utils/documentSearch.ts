import get from 'lodash/get';
import isObject from 'lodash/isObject';

import { CogniteError } from '@cognite/sdk-core';

import { showErrorMessage } from 'components/toast';

import { DEFAULT_ERROR_MESSAGE } from '../constants';

export const handleDocumentSearchError = (error: CogniteError) => {
  const possibleExtraInfo = get(error, 'extra.validationError');

  if (!isObject(possibleExtraInfo)) {
    showErrorMessage(DEFAULT_ERROR_MESSAGE);
    return;
  }

  const possibleKnownError = (possibleExtraInfo as any)[
    'filter.geolocation.shape.__root__'
  ];

  let knownError;

  // bad shape
  if (possibleKnownError?.includes('is invalid')) {
    knownError = 'Please make sure polygon is valid. Eg: does not cross lines';
  }
  // too many points!
  if (possibleKnownError?.includes('exceeds coordinates size limit')) {
    knownError = 'Please draw a smaller polygon';
  }

  showErrorMessage(knownError || DEFAULT_ERROR_MESSAGE);
};
