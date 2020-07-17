/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import { CadNode } from '@/datamodels/cad';
import { MaterialManager } from '@/datamodels/cad/MaterialManager';
import { CadSectorParser } from '@/datamodels/cad/sector/CadSectorParser';
import { SimpleAndDetailedToSector3D } from '@/datamodels/cad/sector/SimpleAndDetailedToSector3D';
import { CachedRepository } from '@/datamodels/cad/sector/CachedRepository';
import { SectorCuller } from '@/datamodels/cad/sector/culling/SectorCuller';

import { createCadModelMetadata } from '../../../testutils/createCadModelMetadata';
import { generateSectorTree } from '../../../testutils/createSectorMetadata';
import { CadModelUpdateHandler } from '@/datamodels/cad/CadModelUpdateHandler';
import { BinaryFileProvider } from '@/utilities/networking/types';

describe('CadModelUpdateHandler', () => {
  const modelSectorProvider: BinaryFileProvider = {
    getBinaryFile: jest.fn()
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
    updateHandler.consumedSectorObservable().subscribe();
    updateHandler.updateModels(cadModel);

    updateHandler.updateCamera(new THREE.PerspectiveCamera());
    jest.advanceTimersByTime(2000);
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
