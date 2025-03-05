/*!
 * Copyright 2025 Cognite AS
 */
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { useModelHandlers } from './useModelHandlers';
import { renderHook } from '@testing-library/react';
import {
  viewerImage360CollectionsMock,
  viewerMock,
  viewerModelsMock
} from '../../../../../tests/tests-utilities/fixtures/viewer';
import { type CogniteModel } from '@cognite/reveal';
import { cadMock } from '../../../../../tests/tests-utilities/fixtures/cadModel';
import { createImage360ClassicMock } from '../../../../../tests/tests-utilities/fixtures/image360';
import { wrapper } from '../../../../../tests/tests-utilities/fixtures/wrapper';

describe(useModelHandlers.name, () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('returns model handlers and update callback', () => {
    const mockModels: CogniteModel[] = [cadMock, cadMock];
    viewerModelsMock.mockReturnValue(mockModels);
    const mockImage360Collection = createImage360ClassicMock();
    viewerImage360CollectionsMock.mockReturnValue([mockImage360Collection]);

    const { result } = renderHook(
      () => useModelHandlers(undefined, undefined, viewerMock, mockModels),
      { wrapper }
    );

    const [modelHandlers, update] = result.current;

    expect(modelHandlers).toBeDefined();
    expect(update).toBeDefined();
  });
});
