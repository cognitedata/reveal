/*!
 * Copyright 2025 Cognite AS
 */
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { useSyncExternalLayersState } from './useSyncExternalLayersState';
import { renderHook } from '@testing-library/react';
import {
  createCadHandlerMock,
  createPointCloudHandlerMock,
  createImage360HandlerMock
} from '../../../../../tests/tests-utilities/fixtures/modelHandler';
import { wrapper } from '../../../../../tests/tests-utilities/fixtures/wrapper';

describe(useSyncExternalLayersState.name, () => {
  const mockCadHandler = createCadHandlerMock();
  const mockPointCloudHandler = createPointCloudHandlerMock();
  const mockImage360Handler = createImage360HandlerMock();
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('syncs external layers state with viewer', () => {
    const modelLayerHandlers = {
      cadHandlers: [mockCadHandler],
      pointCloudHandlers: [mockPointCloudHandler],
      image360Handlers: [mockImage360Handler]
    };
    const externalLayersState = undefined;
    const setExternalLayersState = vi.fn();
    const update = vi.fn();

    renderHook(
      () => {
        useSyncExternalLayersState(
          modelLayerHandlers,
          externalLayersState,
          setExternalLayersState,
          update
        );
      },
      { wrapper }
    );

    expect(update).toHaveBeenCalled();
  });
});
