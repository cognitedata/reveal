/*!
 * Copyright 2020 Cognite AS
 */

import { MemoryRequestCache } from '../../cache/MemoryRequestCache';

describe('MemoryCache', () => {
  const getSectorMock = jest.fn();

  const getSector = (id: number, _data: null) => {
    getSectorMock(id);
    return 'MyString';
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('fetch on new id, fetches', () => {
    const getCached = new MemoryRequestCache<number, null, string>(getSector);
    getCached.request(0, null);
    expect(getSectorMock).toBeCalledWith(0);
  });

  test('fetch on cached id, loads from cached', () => {
    // Arrange
    const getCached = new MemoryRequestCache<number, null, string>(getSector);
    getCached.request(0, null);
    jest.resetAllMocks();

    // Act
    getCached.request(0, null);

    // Assert
    expect(getSectorMock).not.toBeCalled();
  });

  // TODO add test that requires data
});
