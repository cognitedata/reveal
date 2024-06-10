import { describe, expect, test, vi, beforeEach } from 'vitest';

import { Mock } from 'moq.ts';

import { renderHook } from '@testing-library/react';

import { useRemoveNonReferencedModels } from '../../../../src/components/Reveal3DResources/useRemoveNonReferencedModels';
import {
  Cognite3DViewer,
  CogniteCadModel,
  CogniteModel,
  CognitePointCloudModel,
  Image360Collection
} from '@cognite/reveal';
import { Matrix4 } from 'three';

const viewerModelsMock = vi.fn<[], CogniteModel[]>();
const viewerRemoveModelsMock = vi.fn<[CogniteModel], void>();
const viewerImage360CollectionsMock = vi.fn<[], Image360Collection[]>();

const viewerMock = new Mock<Cognite3DViewer>()
  .setup((p) => p.models)
  .callback(viewerModelsMock)
  .setup((p) => p.get360ImageCollections())
  .callback(viewerImage360CollectionsMock)
  .setup((p) => p.removeModel)
  .returns(viewerRemoveModelsMock)
  .object();

const cadModelOptions = {
  modelId: 123,
  revisionId: 456
};

const pointCloudModelOptions = {
  modelId: 321,
  revisionId: 654
};

const cadMock = new Mock<CogniteCadModel>()
  .setup((p) => p.modelId)
  .returns(cadModelOptions.modelId)
  .setup((p) => p.revisionId)
  .returns(cadModelOptions.revisionId)
  .setup((p) => p.getModelTransformation())
  .returns(new Matrix4())
  .object();

const pointCloudMock = new Mock<CognitePointCloudModel>()
  .setup((p) => p.modelId)
  .returns(pointCloudModelOptions.modelId)
  .setup((p) => p.revisionId)
  .returns(pointCloudModelOptions.revisionId)
  .setup((p) => p.getModelTransformation())
  .returns(new Matrix4())
  .object();

const image360Options = {
  siteId: 'siteId'
};

const image360Mock = new Mock<Image360Collection>()
  .setup((p) => p.id)
  .returns(image360Options.siteId)
  .object();

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
