/*!
 * Copyright 2021 Cognite AS
 */

import type { CogniteClient, Revision3D } from '@cognite/sdk';
import { CdfModelIdentifier } from '../model-identifiers/CdfModelIdentifier';
import { CdfModelMetadataProvider } from './CdfModelMetadataProvider';
import { File3dFormat } from '../types';
import { Mock } from 'moq.ts';
import { Vector3 } from 'three';
import { vi } from 'vitest';

describe(CdfModelMetadataProvider.name, () => {
  const baseUrl = 'https://api.cognitedata.com';
  const project = 'my-project';

  let modelIdentifier: CdfModelIdentifier;
  let provider: CdfModelMetadataProvider;
  const retrieveRevision = vi.fn<CogniteClient['revisions3D']['retrieve']>();

  beforeEach(async () => {
    modelIdentifier = new CdfModelIdentifier(1337, 42);

    const mockedClient = new Mock<CogniteClient>()
      .setup(c => c.getBaseUrl())
      .returns(baseUrl)
      .setup(c => c.project)
      .returns(project)
      .setup(c => c.revisions3D)
      .returns(
        new Mock<CogniteClient['revisions3D']>()
          .setup(revisions => revisions.retrieve)
          .returns(retrieveRevision)
          .object()
      )
      .object();

    provider = new CdfModelMetadataProvider(mockedClient);
  });

  test('getModelUri returns correct URL for a valid output', async () => {
    const formatMetadata = { format: File3dFormat.GltfCadModel, version: 9, blobId: 1 };
    const expectedUrl = `${baseUrl}/api/v1/projects/${project}/3d/files/${formatMetadata.blobId}`;

    const uri = await provider.getModelUri(modelIdentifier, formatMetadata);

    expect(uri).toEqual(expectedUrl);
  });

  test('getModelUriForSignedFiles returns correct signed files endpoint URL', async () => {
    const expectedUrl = `${baseUrl}/api/v1/projects/${project}/3d/output/files`;

    const uri = provider.getModelUriForSignedFiles();

    expect(uri).toEqual(expectedUrl);
  });

  describe('revision requests', () => {
    const revision: Revision3D = {
      id: 42,
      fileId: 1,
      published: false,
      status: 'Done',
      createdTime: new Date(0),
      assetMappingCount: 0,
      camera: { position: [1, 2, 3], target: [4, 5, 6] }
    };

    beforeEach(() => {
      retrieveRevision.mockReset().mockResolvedValue(revision);
    });

    test('getModelMatrix and getModelCamera requested together fetch the revision once', async () => {
      const [, camera] = await Promise.all([
        provider.getModelMatrix(modelIdentifier, File3dFormat.GltfCadModel),
        provider.getModelCamera(modelIdentifier)
      ]);

      expect(retrieveRevision).toHaveBeenCalledExactlyOnceWith(modelIdentifier.modelId, modelIdentifier.revisionId);
      expect(camera).toEqual({ position: new Vector3(1, 2, 3), target: new Vector3(4, 5, 6) });
    });

    test('fetches the revision again once the previous request has finished', async () => {
      await provider.getModelCamera(modelIdentifier);
      await provider.getModelCamera(modelIdentifier);

      expect(retrieveRevision).toHaveBeenCalledTimes(2);
    });

    test('does not share the request between different revisions', async () => {
      const otherModelIdentifier = new CdfModelIdentifier(modelIdentifier.modelId, modelIdentifier.revisionId + 1);

      await Promise.all([provider.getModelCamera(modelIdentifier), provider.getModelCamera(otherModelIdentifier)]);

      expect(retrieveRevision).toHaveBeenCalledTimes(2);
    });

    test('fails all the callers of a failed request and fetches again afterwards', async () => {
      retrieveRevision.mockRejectedValueOnce(new Error('Request failed'));

      const results = await Promise.allSettled([
        provider.getModelMatrix(modelIdentifier, File3dFormat.GltfCadModel),
        provider.getModelCamera(modelIdentifier)
      ]);

      expect(results.map(result => result.status)).toEqual(['rejected', 'rejected']);
      expect(retrieveRevision).toHaveBeenCalledTimes(1);

      await expect(provider.getModelCamera(modelIdentifier)).resolves.toBeDefined();
      expect(retrieveRevision).toHaveBeenCalledTimes(2);
    });
  });
});
