/*!
 * Copyright 2021 Cognite AS
 */

import { ModelStateHandler } from './ModelStateHandler';
import { WantedSector, ConsumedSector } from './types';
import { LevelOfDetail } from './LevelOfDetail';
import { Box3 } from '../../../utilities';

describe('ModelStateHandler', () => {
  // TODO: 10-08-2020 j-bjorne: Consider changing WantedSector and ConsumedSector metadata field. Annoying to mock.
  const { simple, detailed, discarded } = mockWantedSectors(1);

  test('hasStateChanged', () => {
    const modelStateHandler = new ModelStateHandler();
    const consumedSimple: ConsumedSector = { ...simple, group: undefined };

    modelStateHandler.updateState(consumedSimple);
    expect(modelStateHandler.hasStateChanged(simple)).toBe(false);

    const differentSectors: WantedSector[] = [detailed, discarded];
    differentSectors.forEach(wantedSector => {
      expect(modelStateHandler.hasStateChanged(wantedSector)).toBe(true);
    });
  });

  test('updateState', () => {
    const modelStateHandler = new ModelStateHandler();
    const sectors = [simple, detailed, discarded];
    sectors.forEach(wantedSector => {
      const consumedSector = { ...wantedSector, group: undefined };
      modelStateHandler.updateState(consumedSector);
      expect(modelStateHandler.hasStateChanged(wantedSector)).toBe(false);
    });
  });
});

function mockWantedSectors(id: number) {
  const metadata = {
    id,
    path: '0/',
    depth: 0,
    bounds: new Box3([]),
    estimatedDrawCallCount: 0,
    indexFile: {
      fileName: `sector_${id}.i3d`,
      peripheralFiles: [],
      downloadSize: 0
    },
    facesFile: {
      fileName: `sector_${id}.f3d`,
      quadSize: 0,
      coverageFactors: {
        xy: 0,
        xz: 0,
        yz: 0
      },
      recursiveCoverageFactors: {
        xy: 0,
        xz: 0,
        yz: 0
      },
      downloadSize: 0
    },
    children: []
  };

  const blobUrl = '';
  return {
    simple: { blobUrl, metadata, levelOfDetail: LevelOfDetail.Simple },
    detailed: { blobUrl, metadata, levelOfDetail: LevelOfDetail.Detailed },
    discarded: { blobUrl, metadata, levelOfDetail: LevelOfDetail.Discarded }
  };
}
