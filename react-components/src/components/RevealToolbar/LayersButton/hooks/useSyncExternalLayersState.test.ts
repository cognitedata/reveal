/*!
 * Copyright 2025 Cognite AS
 */
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { useSyncExternalLayersState } from './useSyncExternalLayersState';
import { renderHook } from '@testing-library/react';
import { viewerMock } from '../../../../../tests/tests-utilities/fixtures/viewer';
import { createRenderTargetMock } from '../../../../../tests/tests-utilities/fixtures/renderTarget';
import {
  createCadHandlerMock,
  createPointCloudHandlerMock,
  createImage360HandlerMock
} from '../../../../../tests/tests-utilities/fixtures/modelHandler';

const renderTargetMock = createRenderTargetMock();

vi.mock('../../../RevealCanvas/ViewerContext', () => ({
  useReveal: () => viewerMock,
  useRenderTarget: () => renderTargetMock
}));

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

    renderHook(() => {
      useSyncExternalLayersState(
        modelLayerHandlers,
        externalLayersState,
        setExternalLayersState,
        update
      );
    });

    expect(update).toHaveBeenCalled();
  });
});
