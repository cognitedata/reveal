/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
import { Matrix4 } from 'three';
import { PointCloudFactory } from './PointCloudFactory';
import type { ClassificationInfo, Potree } from './potree-three-loader';
import { DEFAULT_POINT_CLOUD_METADATA_FILE } from './constants';
import type { IPointClassificationsProvider } from './classificationsProviders/IPointClassificationsProvider';
import type { ClassicDataSourceType, DataSourceType, PointCloudStylableObjectProvider } from '@reveal/data-providers';
import { CdfModelIdentifier, File3dFormat } from '@reveal/data-providers';
import { PointCloudMaterialManager } from '@reveal/rendering';
import type { PointCloudMetadata } from './PointCloudMetadata';
import { createPointCloudNode } from '../../../test-utilities';

const modelIdentifier = new CdfModelIdentifier(1, 2);
const classifications: ClassificationInfo = {
  classificationSets: [{ name: 'Default', classificationSet: [{ name: 'Custom', code: 5, rgb: '#ff0000' }] }]
};

function stubProvider<T extends DataSourceType = ClassicDataSourceType>(): PointCloudStylableObjectProvider<T> {
  return {
    getPointCloudObjects: vi.fn(async () => [])
  } as Partial<PointCloudStylableObjectProvider<T>> as PointCloudStylableObjectProvider<T>;
}

function createMetadata(overrides: Partial<PointCloudMetadata> = {}): PointCloudMetadata {
  return {
    format: File3dFormat.EptPointCloud,
    formatVersion: 1,
    modelBaseUrl: 'https://example.com/model',
    signedFilesBaseUrl: 'https://signed-files.example.com',
    modelIdentifier,
    modelMatrix: new Matrix4(),
    scene: {},
    ...overrides
  } as PointCloudMetadata;
}

function createFactory() {
  const loadPointCloud = vi.fn<Potree['loadPointCloud']>(async () => createPointCloudNode().octree);
  const potreeInstance = { loadPointCloud } as Partial<Potree> as Potree;
  const classificationsProvider = {
    getClassifications: vi.fn(async () => classifications)
  } as Partial<IPointClassificationsProvider> as IPointClassificationsProvider;

  const factory = new PointCloudFactory(
    potreeInstance,
    stubProvider(),
    stubProvider(),
    classificationsProvider,
    new PointCloudMaterialManager()
  );
  return { factory, loadPointCloud };
}

describe(PointCloudFactory.name, () => {
  test.each<[string, Partial<PointCloudMetadata>, boolean]>([
    [
      'signedFiles and scene are present',
      {
        signedFiles: { items: [{ fileName: 'ept.json', signedUrl: 'https://cdn/ept.json', subPath: '' }] },
        scene: { points: 10 }
      },
      true
    ],
    ['signedFiles and scene are absent', { scene: undefined }, false]
  ])('preloadedEptData: %s', async (_, metadataOverrides, expectPresent) => {
    const { factory, loadPointCloud } = createFactory();
    const metadata = createMetadata(metadataOverrides);

    const node = await factory.createModel({ modelId: 1, revisionId: 2 }, modelIdentifier, metadata);

    expect(loadPointCloud).toHaveBeenCalledWith(
      metadata.modelBaseUrl,
      DEFAULT_POINT_CLOUD_METADATA_FILE,
      [],
      modelIdentifier,
      metadata.signedFilesBaseUrl,
      expectPresent ? { signedFiles: metadata.signedFiles, fileData: metadata.scene } : undefined
    );
    expect(node.getClasses().some(c => c.name === 'Custom')).toBe(true);
  });
});
