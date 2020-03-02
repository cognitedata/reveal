/*!
 * Copyright 2020 Cognite AS
 */

import { MemoryCache } from '../../cache/MemoryCache';

describe('MemoryCache', () => {
  const getSectorMock = jest.fn();

  const getSector = async (id: number) => {
    getSectorMock(id);
    return 'MyString';
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('fetch on new id, fetches', () => {
    const getCached = new MemoryCache<number, string>(getSector);
    getCached.request(0);
    expect(getSectorMock).toBeCalledWith(0);
  });

  test('fetch on cached id, loads from cached', () => {
    // Arrange
    const getCached = new MemoryCache<number, string>(getSector);
    getCached.request(0);
    jest.resetAllMocks();

    // Act
    getCached.request(0);

    // Assert
    expect(getSectorMock).not.toBeCalled();
  });
});
