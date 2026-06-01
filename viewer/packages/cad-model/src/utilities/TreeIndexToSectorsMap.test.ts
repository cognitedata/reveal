/*!
 * Copyright 2023 Cognite AS
 */

import { RevealGeometryCollectionType } from '@reveal/sector-parser';
import { TreeIndexToSectorsMap } from './TreeIndexToSectorsMap';
import { vi } from 'vitest';

describe('TreeIndexToSectorsMap', () => {
  let map: TreeIndexToSectorsMap;

  beforeEach(() => {
    map = new TreeIndexToSectorsMap(100);
    map.onChange = vi.fn();
  });

  test('maps from tree index to set of sectors', () => {
    expect(Array.from(map.getSectorIdsForTreeIndex(100))).toHaveLength(0);

    map.set(100, 1);
    map.set(100, 2);
    map.set(100, 3);

    expect(Array.from(map.getSectorIdsForTreeIndex(100))).toHaveLength(3);
    expect(Array.from(map.getSectorIdsForTreeIndex(100)).sort()).toEqual([1, 2, 3]);
  });

  test('fires callback when tree index is found in a new sector', () => {
    map.set(100, 1); // New
    expect(map.onChange).toHaveBeenLastCalledWith(100, 1);
    map.set(100, 1); // Not new
    expect(map.onChange).toHaveBeenCalledTimes(1);
    map.set(100, 2); // New
    expect(map.onChange).toHaveBeenLastCalledWith(100, 2);
  });

  test('should keep track of which geometry types that are completed for each sector', () => {
    const sectorId = 1337;
    expect(map.isCompleted(sectorId, RevealGeometryCollectionType.BoxCollection)).toBeFalsy();
    map.markCompleted(sectorId, RevealGeometryCollectionType.BoxCollection);
    expect(map.isCompleted(sectorId, RevealGeometryCollectionType.BoxCollection)).toBeTruthy();

    expect(map.isCompleted(sectorId, RevealGeometryCollectionType.ConeCollection)).toBeFalsy();
    // Covers the alternative branch when a Sector already has a map
    map.markCompleted(sectorId, RevealGeometryCollectionType.ConeCollection);
    expect(map.isCompleted(sectorId, RevealGeometryCollectionType.ConeCollection)).toBeTruthy();
  });
});
