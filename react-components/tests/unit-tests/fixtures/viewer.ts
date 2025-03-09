import { vi } from 'vitest';

import {
  type DataSourceType,
  type Cognite3DViewer,
  type CogniteModel,
  type Image360Collection
} from '@cognite/reveal';
import { Mock, It } from 'moq.ts';
import { cameraManagerMock } from './cameraManager';

const domElement = document.createElement('div').appendChild(document.createElement('canvas'));

export const viewerModelsMock = vi.fn<[], Array<CogniteModel<DataSourceType>>>();
export const viewerRemoveModelsMock = vi.fn<[CogniteModel<DataSourceType>], void>();
export const viewerImage360CollectionsMock = vi.fn<[], Array<Image360Collection<DataSourceType>>>();
export const fitCameraToVisualSceneBoundingBoxMock = vi.fn<[number?], void>();
export const fitCameraToModelsMock = vi.fn<
  [Array<CogniteModel<DataSourceType>>, number?, boolean?],
  void
>();

export const viewerMock = new Mock<Cognite3DViewer<DataSourceType>>()
  .setup((viewer) => {
    viewer.setBackgroundColor(It.IsAny());
  })
  .returns()
  .setup((viewer) => viewer.domElement)
  .returns(domElement)
  .setup((p) => p.models)
  .callback(viewerModelsMock)
  .setup((p) => p.get360ImageCollections())
  .callback(viewerImage360CollectionsMock)
  .setup((p) => p.removeModel)
  .returns(viewerRemoveModelsMock)
  .setup((p) => p.cameraManager)
  .returns(cameraManagerMock)
  .setup((p) => p.fitCameraToVisualSceneBoundingBox)
  .returns(fitCameraToVisualSceneBoundingBoxMock)
  .setup((p) => p.fitCameraToModels)
  .returns(fitCameraToModelsMock)
  .setup((p) => p.addCustomObject)
  .returns(() => vi.fn())
  .setup((p) => p.on)
  .returns(() => vi.fn())
  .setup((p) => p.off)
  .returns(() => vi.fn())
  .object();
