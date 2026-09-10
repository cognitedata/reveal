/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
import { Matrix4 } from 'three';
import { PointCloudFactory } from './PointCloudFactory';
import type { ClassificationInfo, Potree } from './potree-three-loader';
import { DEFAULT_POINT_CLOUD_METADATA_FILE } from './constants';
import type {
  ClassicDataSourceType,
  DataSourceType,
  DMDataSourceType,
  PointCloudStylableObjectProvider
} from '@reveal/data-providers';
import { CdfModelIdentifier, File3dFormat } from '@reveal/data-providers';
import { PointCloudMaterialManager } from '@reveal/rendering';
import type { PointCloudMetadata } from './PointCloudMetadata';
import { createPointCloudNode } from '../../../test-utilities';
import type { IPointClassificationsProvider } from './classificationsProviders/IPointClassificationsProvider';

const modelIdentifier = new CdfModelIdentifier(1, 2);
const modelBaseUrl = 'https://example.com/model';
const signedFilesBaseUrl = 'https://signed-files.example.com';
const classifications: ClassificationInfo = {
  classificationSets: [{ name: 'Default', classificationSet: [{ name: 'Custom', code: 5, rgb: '#ff0000' }] }]
};
function createEmptyStylableProvider<T extends DataSourceType>(): PointCloudStylableObjectProvider<T> {
  const partial: Partial<PointCloudStylableObjectProvider<T>> = {
    getPointCloudObjects: vi.fn(async () => [])
  };
  return partial as PointCloudStylableObjectProvider<T>;
}

const emptyClassicProvider = createEmptyStylableProvider<ClassicDataSourceType>();
const emptyDMProvider = createEmptyStylableProvider<DMDataSourceType>();

function createMetadata(overrides: Partial<PointCloudMetadata> = {}): PointCloudMetadata {
  return {
    format: File3dFormat.EptPointCloud,
    formatVersion: 1,
    modelBaseUrl,
    signedFilesBaseUrl,
    modelIdentifier,
    modelMatrix: new Matrix4(),
    scene: {},
    ...overrides
  } as PointCloudMetadata;
}

function createFactory() {
  const loadPointCloud = vi.fn<Potree['loadPointCloud']>(async () => createPointCloudNode().octree);
  const potreePartial: Partial<Potree> = { loadPointCloud };
  const classificationsProviderPartial: Partial<IPointClassificationsProvider> = {
    getClassifications: vi.fn(async () => classifications)
  };
  const factory = new PointCloudFactory(
    potreePartial as Potree,
    emptyClassicProvider,
    emptyDMProvider,
    classificationsProviderPartial as IPointClassificationsProvider,
    new PointCloudMaterialManager()
  );
  return { factory, loadPointCloud };
}

describe(PointCloudFactory.name, () => {
  test.each<[string, Partial<PointCloudMetadata>, boolean]>([
    [
      'signedFiles+scene present',
      {
        signedFiles: { items: [{ fileName: 'ept.json', signedUrl: 'https://cdn/ept.json', subPath: '' }] },
        scene: { points: 10 }
      },
      true
    ],
    ['signedFiles+scene absent', { scene: undefined }, false]
  ])('preloadedEptData when %s', async (_, metadataOverrides, expectPresent) => {
    const { factory, loadPointCloud } = createFactory();
    const metadata = createMetadata(metadataOverrides);

    const node = await factory.createModel({ modelId: 1, revisionId: 2 }, modelIdentifier, metadata);

    expect(loadPointCloud).toHaveBeenCalledWith(
      modelBaseUrl,
      DEFAULT_POINT_CLOUD_METADATA_FILE,
      [],
      modelIdentifier,
      signedFilesBaseUrl,
      expectPresent ? { signedFiles: metadata.signedFiles, fileData: metadata.scene } : undefined
    );
    expect(node.getClasses().some(c => c.name === 'Custom')).toBe(true);
  });
});
