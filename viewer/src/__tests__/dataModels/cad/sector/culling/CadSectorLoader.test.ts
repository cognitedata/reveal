/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { CadNode } from '../../../../../datamodels/cad';
import { MaterialManager } from '../../../../../datamodels/cad/MaterialManager';
import { CadSectorLoader } from '../../../../../datamodels/cad/sector/CadSectorLoader';
import { CadSectorParser } from '../../../../../datamodels/cad/sector/CadSectorParser';
import { SectorCuller, WantedSector } from '../../../../../internal';
import { BinaryFileProvider } from '../../../../../utilities/networking/types';
import { createCadModelMetadata } from '../../../../testutils/createCadModelMetadata';
import { generateSectorTree } from '../../../../testutils/createSectorMetadata';

describe('CadSectorLoader', () => {
  const mockFileProvider: BinaryFileProvider = {
    getBinaryFile: jest.fn()
  };
  const materialManager = new MaterialManager();
  const modelDataParser = new CadSectorParser();
  const mockCuller: SectorCuller = {
    determineSectors: jest.fn().mockReturnValue(new Array<WantedSector>(0)),
    dispose: jest.fn()
  };

  const cadModelMetadata = createCadModelMetadata(generateSectorTree(5));
  const cadModel = new CadNode(cadModelMetadata, materialManager);

  jest.useFakeTimers('modern');

  // TODO: 24-07-2020 j-bjorne skipped until pipeline split from update handler.
  test('updateCamera(), updateLoadingHints() and updateClipPlanes() triggers SectorCuller.determineSectors()', async () => {
    const loader = new CadSectorLoader(mockCuller, mockFileProvider, modelDataParser, materialManager);

    loader.addModel(cadModel);

    loader.updateCamera(new THREE.PerspectiveCamera());
    jest.advanceTimersByTime(1000);
    await Promise.resolve(); // Wait for all promises to finish
    expect(mockCuller.determineSectors).toBeCalledTimes(1);
    jest.clearAllMocks();

    loader.updateClippingPlanes([new THREE.Plane()]);
    jest.advanceTimersByTime(1000);
    await Promise.resolve(); // Wait for all promises to finish
    expect(mockCuller.determineSectors).toBeCalledTimes(1);
    jest.clearAllMocks();

    loader.updateClipIntersection(true);
    jest.advanceTimersByTime(1000);
    await Promise.resolve(); // Wait for all promises to finish
    expect(mockCuller.determineSectors).toBeCalledTimes(1);
    jest.clearAllMocks();
  });

  test('dipose() closes subscriptions and disposes culler', async () => {
    const loader = new CadSectorLoader(mockCuller, mockFileProvider, modelDataParser, materialManager);
    const consumedSectorSubscription = loader.consumedSectorObservable().subscribe();
    const loadingStateSubscription = loader.loadingStateObservable().subscribe();
    const parsedDataSubscription = loader.parsedDataObservable().subscribe();
    loader.dispose();
    expect(mockCuller.dispose).toBeCalledTimes(1);
    jest.advanceTimersToNextTimer();
    expect(consumedSectorSubscription.closed).toBeTrue();
    expect(loadingStateSubscription.closed).toBeTrue();
    expect(parsedDataSubscription.closed).toBeTrue();
  });
});
