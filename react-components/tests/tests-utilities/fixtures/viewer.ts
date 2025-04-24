import { vi } from 'vitest';

import {
  type Cognite3DViewer,
  type DataSourceType,
  type CadModelBudget,
  type PointCloudBudget,
  type ResolutionOptions
} from '@cognite/reveal';
import { Mock, It } from 'moq.ts';
import { cameraManagerMock } from './cameraManager';
import { Box3, type Plane } from 'three';

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
export const viewerSetResolutionOptionsMock =
  vi.fn<(resolutionOptions: ResolutionOptions) => void>();

// The Cognite3DViewer class misses the setSceneBoundingBox method, so declare it here
export type ViewerMock = Cognite3DViewer<DataSourceType> & {
  setSceneBoundingBox: (box: Box3) => void;
};

export function isViewerMock(pet: Cognite3DViewer<DataSourceType>): pet is ViewerMock {
  return (pet as ViewerMock).setSceneBoundingBox !== undefined;
}

export const viewerMock = createViewerMock();

export function createViewerMock(): ViewerMock {
  const sceneBoundingBox = new Box3().makeEmpty();
  let clippingPlanes = new Array<Plane>();

  return (
    new Mock<ViewerMock>()
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
      .returns(viewerSetResolutionOptionsMock)

      // Get and set scene bounding box
      .setup((p) => p.getSceneBoundingBox)
      .callback(() => {
        return () => sceneBoundingBox;
      })
      .setup((p) => p.setSceneBoundingBox)
      .returns((boundingBox: Box3) => {
        sceneBoundingBox.copy(boundingBox);
      })
      // Get and set global clipping planes
      .setup((p) => p.getGlobalClippingPlanes)
      .callback(() => {
        return () => clippingPlanes;
      })
      .setup((p) => p.setGlobalClippingPlanes)
      .returns((planes: Plane[]) => {
        clippingPlanes = planes;
      })
      .object()
  );
}
