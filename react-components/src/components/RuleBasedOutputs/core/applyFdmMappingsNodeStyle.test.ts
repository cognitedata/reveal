/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect } from 'vitest';
import { NumericRange, TreeIndexNodeCollection } from '@cognite/reveal';
import { Color } from 'three';
import { type FdmInstanceNodeWithConnectionAndProperties } from '../types';
import {
  mockedFdmInstanceNodeWithConnectionAndProperties,
  outputSelected
} from '../../../../tests/tests-utilities/fixtures/ruleBasedOutputs';
import { applyFdmMappingsNodeStyles } from './applyFdmMappingsNodeStyles';

describe('applyFdmMappingsNodeStyles', () => {
  it('should apply FDM mappings node styles and return styling group and style index', () => {
    const result = applyFdmMappingsNodeStyles(
      mockedFdmInstanceNodeWithConnectionAndProperties,
      outputSelected
    );

    expect(result).toBeDefined();
    expect(result.fdmStylingGroup.fdmAssetExternalIds).toEqual([
      { space: 'space-1', externalId: 'externalId-1' },
      { space: 'space-2', externalId: 'externalId-2' }
    ]);
    expect(result.fdmStylingGroup.style.cad?.color?.getHex()).toBe(new Color('#ff0000').getHex());
    expect(result.fdmStylingGroup.style.pointcloud?.color?.getHex()).toBe(
      new Color('#ff0000').getHex()
    );
  });

  it('should handle empty treeNodes array', () => {
    const treeNodes: FdmInstanceNodeWithConnectionAndProperties[] = [];
    const result = applyFdmMappingsNodeStyles(treeNodes, outputSelected);

    expect(result).toBeDefined();
    expect(result.fdmStylingGroup.fdmAssetExternalIds).toEqual([]);
  });

  it('should return empty fdm instance list on styling group with undefined cadNode', () => {
    const treeNodes: FdmInstanceNodeWithConnectionAndProperties[] = [
      {
        cadNode: undefined,
        connection: {
          instance: { space: 'space-1', externalId: 'externalId-1' },
          modelId: 0,
          revisionId: 0,
          treeIndex: 0
        },
        instanceType: 'node',
        version: 0,
        space: '',
        externalId: '',
        createdTime: 0,
        lastUpdatedTime: 0,
        deletedTime: 0,
        items: [],
        typing: {}
      } satisfies FdmInstanceNodeWithConnectionAndProperties,
      {
        cadNode: undefined,
        connection: {
          instance: { space: 'space-2', externalId: 'externalId-2' },
          modelId: 0,
          revisionId: 0,
          treeIndex: 0
        },
        instanceType: 'node',
        version: 0,
        space: '',
        externalId: '',
        createdTime: 0,
        lastUpdatedTime: 0,
        deletedTime: 0,
        items: [],
        typing: {}
      } satisfies FdmInstanceNodeWithConnectionAndProperties
    ];

    const result = applyFdmMappingsNodeStyles(treeNodes, outputSelected);

    expect(result).toBeDefined();
    expect(result.fdmStylingGroup.fdmAssetExternalIds).toEqual([]);
  });

  it('should correctly update the nodeIndexSet', () => {
    const result = applyFdmMappingsNodeStyles(
      mockedFdmInstanceNodeWithConnectionAndProperties,
      outputSelected
    );

    const nodeIndexSet = new TreeIndexNodeCollection().getIndexSet();
    nodeIndexSet.addRange(new NumericRange(0, 1));
    nodeIndexSet.addRange(new NumericRange(1, 1));

    expect(JSON.stringify(result.styleIndex.getIndexSet()) === JSON.stringify(nodeIndexSet)).toBe(
      true
    );
  });
});
