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

export const viewerModelsMock = vi.fn<[], CogniteModel[]>();
export const viewerRemoveModelsMock = vi.fn<[CogniteModel], void>();
export const viewerImage360CollectionsMock = vi.fn<[], Image360Collection[]>();
export const fitCameraToVisualSceneBoundingBoxMock = vi.fn<[number?], void>();
export const fitCameraToModelsMock = vi.fn<[CogniteModel[], number?, boolean?], void>();

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
  .object();
