/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect } from 'vitest';
import { type AssetMapping3D } from '@cognite/sdk';
import { NumericRange, TreeIndexNodeCollection } from '@cognite/reveal';
import { Color } from 'three';
import { applyAssetMappingsNodeStyles } from './applyAssetMappingsNodeStyles';
import {
  mockedAssetMappings,
  outputSelected
} from '../../../../tests/tests-utilities/fixtures/ruleBasedOutputs';

describe('applyAssetMappingsNodeStyles', () => {
  it('should apply asset mappings node styles and return styling group and style index', () => {
    const result = applyAssetMappingsNodeStyles(mockedAssetMappings, outputSelected);

    expect(result).toBeDefined();
    expect(result.assetStylingGroup.assetIds).toEqual([1, 2]);
    expect(result.assetStylingGroup.style.cad?.color?.getHex()).toBe(new Color('#ffff00').getHex());
    expect(result.assetStylingGroup.style.pointcloud?.color?.getHex()).toBe(
      new Color('#ffff00').getHex()
    );
  });

  it('should handle empty treeNodes array', () => {
    const treeNodes: AssetMapping3D[] = [];

    const result = applyAssetMappingsNodeStyles(treeNodes, outputSelected);

    expect(result).toBeDefined();
    expect(result.assetStylingGroup.assetIds).toEqual([]);
  });

  it('should correctly update the nodeIndexSet', () => {
    const treeNodes: AssetMapping3D[] = [
      {
        assetId: 1,
        treeIndex: 0,
        subtreeSize: 1,
        nodeId: 0
      } satisfies AssetMapping3D,
      {
        assetId: 2,
        treeIndex: 1,
        subtreeSize: 1,
        nodeId: 0
      } satisfies AssetMapping3D
    ];

    const result = applyAssetMappingsNodeStyles(treeNodes, outputSelected);

    const nodeIndexSet = new TreeIndexNodeCollection().getIndexSet();
    nodeIndexSet.addRange(new NumericRange(0, 1));
    nodeIndexSet.addRange(new NumericRange(1, 1));

    expect(JSON.stringify(result.styleIndex.getIndexSet()) === JSON.stringify(nodeIndexSet)).toBe(
      true
    );
  });
});
