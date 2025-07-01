import { describe, expect, test, vi } from 'vitest';
import { useSyncExternalLayersState } from './useSyncExternalLayersState';
import { renderHook } from '@testing-library/react';
import {
  createCadHandlerMock,
  createPointCloudHandlerMock,
  createImage360HandlerMock
} from '#test-utils/fixtures/modelHandler';
import { wrapper } from '#test-components/fixtures/wrapper';

describe(useSyncExternalLayersState.name, () => {
  const mockCadHandler = createCadHandlerMock();
  const mockPointCloudHandler = createPointCloudHandlerMock();
  const mockImage360Handler = createImage360HandlerMock();

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
