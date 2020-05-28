/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import { CadNode } from '@/datamodels/cad';
import { CadSectorProvider } from '@/datamodels/cad/sector/CadSectorProvider';
import { MaterialManager } from '@/datamodels/cad/MaterialManager';
import { CadSectorParser } from '@/datamodels/cad/sector/CadSectorParser';
import { SimpleAndDetailedToSector3D } from '@/datamodels/cad/sector/SimpleAndDetailedToSector3D';
import { CachedRepository } from '@/datamodels/cad/sector/CachedRepository';
import { SectorCuller } from '@/datamodels/cad/sector/culling/SectorCuller';

import { CadModelUpdateHandler } from '@/dataModels/cad/CadModelUpdateHandler';

import { createCadModelMetadata } from '../../../testUtils/createCadModelMetadata';
import { generateSectorTree } from '../../../testUtils/createSectorMetadata';

describe('CadModelUpdateHandler', () => {
  const modelSectorProvider: CadSectorProvider = {
    getCadSectorFile: jest.fn()
  };
  const materialManager = new MaterialManager();
  const modelDataParser = new CadSectorParser();
  const modelDataTransformer = new SimpleAndDetailedToSector3D(materialManager);
  const repository = new CachedRepository(modelSectorProvider, modelDataParser, modelDataTransformer);
  const mockCuller: SectorCuller = {
    determineSectors: jest.fn()
  };

  const cadModelMetadata = createCadModelMetadata(generateSectorTree(5));
  const cadModel = new CadNode(cadModelMetadata, materialManager);

  jest.useFakeTimers();

  test('updateCamera(), updateLoadingHints() and updateClipPlanes() triggers SectorCuller.determineSectors()', () => {
    const updateHandler = new CadModelUpdateHandler(repository, mockCuller);
    updateHandler.observable().subscribe();
    updateHandler.updateModels(cadModel);

    updateHandler.updateCamera(new THREE.PerspectiveCamera());
    jest.advanceTimersByTime(1000);
    expect(mockCuller.determineSectors).toBeCalledTimes(1);

    updateHandler.clippingPlanes = [new THREE.Plane()];
    jest.advanceTimersByTime(1000);
    expect(mockCuller.determineSectors).toBeCalledTimes(2);

    updateHandler.clipIntersection = true;
    jest.advanceTimersByTime(1000);
    expect(mockCuller.determineSectors).toBeCalledTimes(3);

    updateHandler.updateLoadingHints({});
    jest.advanceTimersByTime(1000);
    expect(mockCuller.determineSectors).toBeCalledTimes(4);
  });
});
