/*!
 * Copyright 2024 Cognite AS
 */
import { describe, expect, it } from 'vitest';
import { type NodeItem } from '../FdmSDK';
import { getCogniteAssetDirectRelationProperties } from './getCogniteAssetDirectRelationProperties';
import { viewImplementingCogniteAsset } from '#test-utils/fixtures/dm/viewDefinitions';

describe(getCogniteAssetDirectRelationProperties.name, () => {
  it('Should find direct relation properties which are of type asset', () => {
    const node: NodeItem<Record<string, unknown>> = {
      instanceType: 'node',
      version: 16,
      space: 'test3d',
      externalId: 'custom_asset_1',
      createdTime: 1738170192924,
      lastUpdatedTime: 1743161596936,
      properties: {
        test3d: {
          'CustomAsset/v1': {
            path: [
              {
                space: 'test3d',
                externalId: 'custom_asset_1'
              }
            ],
            root: {
              space: 'test3d',
              externalId: 'custom_asset_2'
            },
            parent: {
              space: 'test3d',
              externalId: 'custom_asset_3'
            },
            pathLastUpdatedTime: '2025-03-28T11:33:16.936314+00:00',
            name: 'AssetName',
            object3D: {
              space: 'test3d',
              externalId: '63ed91e0-ba2b-4e33-a510-2aa1d4143fb3'
            }
          }
        }
      }
    } as const;

    const result = getCogniteAssetDirectRelationProperties(node, viewImplementingCogniteAsset);
    expect(result.length).toBe(2);
    expect(result[0]).toEqual(node.properties.test3d['CustomAsset/v1'].parent);
    expect(result[1]).toEqual(node.properties.test3d['CustomAsset/v1'].root);
  });

  it('Should return nothing if DR property is not found', () => {
    const node: NodeItem<Record<string, unknown>> = {
      instanceType: 'node',
      version: 16,
      space: 'test3d',
      externalId: 'custom_asset_1',
      createdTime: 1738170192924,
      lastUpdatedTime: 1743161596936,
      properties: {
        test3d: {
          'CustomAsset/v1': {
            name: 'AssetName'
          },
          root: {
            space: 'test3d',
            externalId: 'custom_asset_1'
          }
        }
      }
    };

    const result = getCogniteAssetDirectRelationProperties(node, viewImplementingCogniteAsset);
    expect(result.length).toBe(0);
  });

  it('Should return nothing if DR points to itself', () => {
    const node: NodeItem<Record<string, unknown>> = {
      instanceType: 'node',
      version: 16,
      space: 'test3d',
      externalId: 'custom_asset_1',
      createdTime: 1738170192924,
      lastUpdatedTime: 1743161596936,
      properties: {
        test3d: {
          'CustomAsset/v1': {
            name: 'AssetName'
          }
        }
      }
    };

    const result = getCogniteAssetDirectRelationProperties(node, viewImplementingCogniteAsset);
    expect(result.length).toBe(0);
  });
});
