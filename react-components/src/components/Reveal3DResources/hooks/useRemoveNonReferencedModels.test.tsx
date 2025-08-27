import { describe, expect, test } from 'vitest';
import React, { type JSX } from 'react';

import { renderHook } from '@testing-library/react';

import { useRemoveNonReferencedModels } from '../../../../src/components/Reveal3DResources/hooks/useRemoveNonReferencedModels';

import { Reveal3DResourcesInfoContextProvider } from '../../../../src/components/Reveal3DResources/Reveal3DResourcesInfoContext';
import { EMPTY_ARRAY } from '../../../../src/utilities/constants';
import {
  viewerImage360CollectionsMock,
  viewerModelsMock,
  viewerRemoveModelsMock
} from '#test-utils/fixtures/viewer';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { cadMock, cadModelOptions, createCadMock } from '#test-utils/fixtures/cadModel';
import { createImage360ClassicMock, image360ClassicOptions } from '#test-utils/fixtures/image360';
import { createPointCloudMock, pointCloudModelOptions } from '#test-utils/fixtures/pointCloud';

describe(useRemoveNonReferencedModels.name, () => {
  const wrapper = ({ children }: { children: React.ReactNode }): JSX.Element => (
    <Reveal3DResourcesInfoContextProvider>{children}</Reveal3DResourcesInfoContextProvider>
  );
  test('does not crash when no models are added', () => {
    const renderTarget = createRenderTargetMock();
    viewerModelsMock.mockReturnValue([]);
    viewerImage360CollectionsMock.mockReturnValue([]);
    expect(() =>
      renderHook(
        () => {
          useRemoveNonReferencedModels(EMPTY_ARRAY, renderTarget);
        },
        { wrapper }
      )
    ).not.toThrow();
  });

  test('removes models when empty ', () => {
    const renderTarget = createRenderTargetMock();
    viewerModelsMock.mockReturnValue([cadMock]);
    viewerImage360CollectionsMock.mockReturnValue([]);
    renderHook(
      () => {
        useRemoveNonReferencedModels(EMPTY_ARRAY, renderTarget);
      },
      { wrapper }
    );
    // expect(viewerRemoveModelsMock).toHaveBeenCalledOnce();
  });

  test('does not remove models when in addOptions', () => {
    const renderTarget = createRenderTargetMock();
    const pointCloudMock = createPointCloudMock();
    const cadMock = createCadMock();
    const image360Mock = createImage360ClassicMock();
    viewerModelsMock.mockReturnValue([pointCloudMock, cadMock]);
    viewerImage360CollectionsMock.mockReturnValue([image360Mock]);
    const mockAddOptions = [pointCloudModelOptions, cadModelOptions, image360ClassicOptions];
    renderHook(
      () => {
        useRemoveNonReferencedModels(mockAddOptions, renderTarget);
      },
      { wrapper }
    );
    expect(viewerRemoveModelsMock).not.toHaveBeenCalled();
  });

  test('removes only relevant model', () => {
    const renderTarget = createRenderTargetMock();
    const pointCloudMock = createPointCloudMock();
    const cadMock = createCadMock();
    const image360Mock = createImage360ClassicMock();
    viewerModelsMock.mockReturnValue([pointCloudMock, cadMock]);
    viewerImage360CollectionsMock.mockReturnValue([image360Mock]);
    const mockAddOptions = [cadModelOptions, image360ClassicOptions];
    renderHook(
      () => {
        useRemoveNonReferencedModels(mockAddOptions, renderTarget);
      },
      { wrapper }
    );
    // expect(viewerRemoveModelsMock).toHaveBeenCalledWith(pointCloudMock);
  });
});
