/*!
 * Copyright 2019 Cognite AS
 */

import { createCache } from '../../models/createCache';

describe('createCache', () => {
  const fetchCb: (id: number) => Promise<ArrayBuffer> = jest.fn();
  const parseCb: (id: number, buffer: ArrayBuffer) => Promise<string> = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('fetch on new id, fetches', () => {
    const [fetch, parse] = createCache<number, string>(fetchCb, parseCb);
    fetch(0);
    expect(fetchCb).toBeCalledWith(0);
  });

  test('fetch on cached id, loads from cached', () => {
    // Arrange
    const [fetch, parse] = createCache<number, string>(fetchCb, parseCb);
    fetch(0);
    jest.resetAllMocks();

    // Act
    fetch(0);

    // Assert
    expect(fetchCb).not.toBeCalled();
  });

  test('parse on new id, parses', () => {
    const [fetch, parse] = createCache<number, string>(fetchCb, parseCb);
    const buffer = new ArrayBuffer(10);
    parse(0, buffer);
    expect(parseCb).toBeCalledWith(0, buffer);
  });

  test('parse on cached id, loads from cached', () => {
    // Arrange
    const [fetch, parse] = createCache<number, string>(fetchCb, parseCb);
    const buffer = new ArrayBuffer(10);
    parse(0, buffer);
    jest.resetAllMocks();

    // Act
    parse(0, buffer);

    // Assert
    expect(parseCb).not.toBeCalled();
  });
});
