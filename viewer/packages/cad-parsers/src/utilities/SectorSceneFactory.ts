/*!
 * Copyright 2021 Cognite AS
 */
import { SectorSceneImpl } from './SectorScene';
import { SectorMetadata } from '../metadata/types';

import { traverseDepthFirst } from '@reveal/utilities';

import assert from 'assert';

/**
 * Factory for creating instance of {@link SectorScene} based on
 * the version of the format provided.
 */
export class SectorSceneFactory {
  createSectorScene(version: number, maxTreeIndex: number, unit: string, root: SectorMetadata) {
    assert(version === 8 || version === 9, 'Only version 8 and 9 is currently supported');

    const sectorsById: Map<number, SectorMetadata> = new Map();
    traverseDepthFirst(root, x => {
      sectorsById.set(x.id, x);
      return true;
    });
    return new SectorSceneImpl(version, maxTreeIndex, unit, root, sectorsById);
  }
}
