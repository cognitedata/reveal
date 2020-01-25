/*!
 * Copyright 2020 Cognite AS
 */

import { createSimpleCache } from '../../models/createCache';

describe('createCache', () => {
  const getSectorMock = jest.fn();

  const getSector = async (id: number) => {
    getSectorMock(id);
    return 'MyString';
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('fetch on new id, fetches', () => {
    const getCached = createSimpleCache<number, string>(getSector);
    getCached.request(0);
    expect(getSectorMock).toBeCalledWith(0);
  });

  test('fetch on cached id, loads from cached', () => {
    // Arrange
    const getCached = createSimpleCache<number, string>(getSector);
    getCached.request(0);
    jest.resetAllMocks();

    // Act
    getCached.request(0);

    // Assert
    expect(getSectorMock).not.toBeCalled();
  });
});
