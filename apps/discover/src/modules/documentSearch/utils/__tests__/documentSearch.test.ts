import { CogniteError } from '@cognite/sdk-core';

import { showErrorMessage } from 'components/Toast';

import { DEFAULT_ERROR_MESSAGE } from '../../constants';
import { handleDocumentSearchError } from '../documentSearch';

const showErrorMessageMock = jest.fn();
jest.mock('components/Toast', () => ({
  showErrorMessage: jest.fn(),
}));

const requestId = '123';

describe('handle document search error', () => {
  beforeEach(() => {
    (showErrorMessage as jest.Mock).mockImplementation(showErrorMessageMock);
  });

  afterEach(() => {
    (showErrorMessage as jest.Mock).mockClear();
  });

  it('should return default error message when no extra info is sent', () => {
    handleDocumentSearchError(new CogniteError('Error Message', 401));
    expect(showErrorMessageMock).toHaveBeenCalledWith(DEFAULT_ERROR_MESSAGE);
  });

  it('should return default error message when validation error has unknown error', () => {
    handleDocumentSearchError(
      new CogniteError('Error Message', 401, requestId, {
        extra: {
          validationError: {
            'filter.geolocation.shape.__root__': 'unknown error',
          },
        },
      })
    );
    expect(showErrorMessageMock).toHaveBeenCalledWith(DEFAULT_ERROR_MESSAGE);
  });

  it('should return default error message when validation error is empty', () => {
    handleDocumentSearchError(
      new CogniteError('Error Message', 401, requestId, {
        extra: {
          validationError: {},
        },
      })
    );
    expect(showErrorMessageMock).toHaveBeenCalledWith(DEFAULT_ERROR_MESSAGE);
  });

  it('should return default error message when validation error has "is invalid" in it', () => {
    handleDocumentSearchError(
      new CogniteError('Error Message', 401, requestId, {
        extra: {
          validationError: {
            'filter.geolocation.shape.__root__': 'Polygon is invalid.',
          },
        },
      })
    );
    expect(showErrorMessageMock).toHaveBeenCalledWith(
      'Please make sure polygon is valid. Eg: does not cross lines'
    );
  });

  it('should return default error message when validation error has "exceeds coordinates size limit" in it', () => {
    handleDocumentSearchError(
      new CogniteError('Error Message', 401, requestId, {
        extra: {
          validationError: {
            'filter.geolocation.shape.__root__':
              'Polygon exceeds coordinates size limit.',
          },
        },
      })
    );
    expect(showErrorMessageMock).toHaveBeenCalledWith(
      'Please draw a smaller polygon'
    );
  });
});
