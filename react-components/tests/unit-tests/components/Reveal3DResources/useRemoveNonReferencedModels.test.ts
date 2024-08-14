import { describe, expect, test, vi, beforeEach } from 'vitest';

import { Mock } from 'moq.ts';

import { renderHook } from '@testing-library/react';

import { useRemoveNonReferencedModels } from '../../../../src/components/Reveal3DResources/useRemoveNonReferencedModels';

import {
  viewerImage360CollectionsMock,
  viewerMock,
  viewerModelsMock,
  viewerRemoveModelsMock
} from '../../fixtures/viewer';
import { cadMock, cadModelOptions } from '../../fixtures/cadModel';
import { pointCloudMock, pointCloudModelOptions } from '../../fixtures/pointCloud';
import { image360Mock, image360Options } from '../../fixtures/image360';

describe(useRemoveNonReferencedModels.name, () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('does not crash when no models are added', () => {
    viewerModelsMock.mockReturnValue([]);
    viewerImage360CollectionsMock.mockReturnValue([]);
    expect(() => renderHook(() => useRemoveNonReferencedModels([], viewerMock))).not.toThrow();
  });

  test('removes models when empty ', () => {
    viewerModelsMock.mockReturnValue([cadMock]);
    viewerImage360CollectionsMock.mockReturnValue([]);
    renderHook(() => useRemoveNonReferencedModels([], viewerMock));
    expect(viewerRemoveModelsMock).toHaveBeenCalledOnce();
  });

  test('does not remove models when in addOptions', () => {
    viewerModelsMock.mockReturnValue([pointCloudMock, cadMock]);
    viewerImage360CollectionsMock.mockReturnValue([image360Mock]);
    renderHook(() =>
      useRemoveNonReferencedModels(
        [cadModelOptions, pointCloudModelOptions, image360Options],
        viewerMock
      )
    );
    expect(viewerRemoveModelsMock).not.toHaveBeenCalled();
  });

  test('removes only relevant model', () => {
    viewerModelsMock.mockReturnValue([pointCloudMock, cadMock]);
    viewerImage360CollectionsMock.mockReturnValue([image360Mock]);
    renderHook(() => useRemoveNonReferencedModels([cadModelOptions, image360Options], viewerMock));
    expect(viewerRemoveModelsMock).toHaveBeenCalledWith(pointCloudMock);
  });
});
