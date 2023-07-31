import { SequenceDataError } from 'domain/wells/types';

import { handleServiceError } from 'utils/errors';

export const handleDepthMeasurementDataServiceError = (
  error: Error,
  sequenceExternalId: string
) => {
  const errorMessage = `Error fetching depth measurement data of '${sequenceExternalId}': ${String(
    error.message
  )}`;

  const errorResponse = {
    source: {
      sourceName: '',
      sequenceExternalId,
    },
    errors: [{ message: errorMessage }],
  };

  return handleServiceError<SequenceDataError>(
    error,
    errorResponse,
    errorMessage
  );
};
