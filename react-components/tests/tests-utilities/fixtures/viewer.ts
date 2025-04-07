import { vi } from 'vitest';

import {
  type DataSourceType,
  type Cognite3DViewer,
  type CadModelBudget,
  type PointCloudBudget
} from '@cognite/reveal';
import { Mock, It } from 'moq.ts';
import { cameraManagerMock } from './cameraManager';

const domElement = document.createElement('div').appendChild(document.createElement('canvas'));

export const viewerModelsMock = vi.fn<() => Cognite3DViewer['models']>();
export const viewerRemoveModelsMock = vi.fn<Cognite3DViewer['removeModel']>();
export const viewerAddCadModelMock = vi.fn<Cognite3DViewer['addCadModel']>();
export const viewerAddPointCloudModelMock = vi.fn<Cognite3DViewer['addPointCloudModel']>();
export const viewerAdd360ImageSetMock = vi.fn();
export const viewerImage360CollectionsMock = vi.fn<Cognite3DViewer['get360ImageCollections']>();
export const fitCameraToVisualSceneBoundingBoxMock =
  vi.fn<Cognite3DViewer['fitCameraToVisualSceneBoundingBox']>();
export const fitCameraToModelsMock = vi.fn<Cognite3DViewer['fitCameraToModels']>();
export const viewerSetCadModelBudgetMock = vi.fn<(budget: CadModelBudget) => void>();
export const viewerSetPointCloudModelBudgetMock = vi.fn<(budget: PointCloudBudget) => void>();

export const viewerMock = new Mock<Cognite3DViewer<DataSourceType>>()
  .setup((viewer) => {
    viewer.setBackgroundColor(It.IsAny());
  })
  .returns()
  .setup((viewer) => viewer.domElement)
  .returns(domElement)
  .setup((p) => p.models)
  .callback(viewerModelsMock)
  .setup((p) => p.get360ImageCollections)
  .returns(viewerImage360CollectionsMock)
  .setup((p) => p.removeModel)
  .returns(viewerRemoveModelsMock)
  .setup((p) => p.addCadModel)
  .returns(viewerAddCadModelMock)
  .setup((p) => p.addPointCloudModel)
  .returns(viewerAddPointCloudModelMock)
  .setup((p) => p.add360ImageSet)
  .returns(viewerAdd360ImageSetMock)
  .setup((p) => p.cameraManager)
  .returns(cameraManagerMock)
  .setup((p) => p.fitCameraToVisualSceneBoundingBox)
  .returns(fitCameraToVisualSceneBoundingBoxMock)
  .setup((p) => p.fitCameraToModels)
  .returns(fitCameraToModelsMock)
  .setup((p) => p.requestRedraw)
  .returns(vi.fn())
  .setup((p) => p.on)
  .returns(vi.fn())
  .setup((p) => p.off)
  .returns(vi.fn())
  .setup((p) => p.addObject3D)
  .returns(vi.fn())
  .setup((p) => p.removeObject3D)
  .returns(vi.fn())
  .setup((p) => p.addCustomObject)
  .returns(vi.fn())
  .setup((p) => p.removeCustomObject)
  .returns(vi.fn())
  .setup((p) => (p.cadBudget = It.IsAny<CadModelBudget>()))
  .callback((argumentInfo) => {
    viewerSetCadModelBudgetMock(argumentInfo.args[0]);
  })
  .setup((p) => (p.pointCloudBudget = It.IsAny<PointCloudBudget>()))
  .callback((argumentInfo) => {
    viewerSetPointCloudModelBudgetMock(argumentInfo.args[0]);
  })
  .setup((p) => p.setResolutionOptions)
  .returns(vi.fn())
  .object();
