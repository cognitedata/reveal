/*!
 * Copyright 2021 Cognite AS
 */

import type { CogniteClient } from '@cognite/sdk';
import { CdfModelIdentifier } from '../model-identifiers/CdfModelIdentifier';
import { CdfModelMetadataProvider } from './CdfModelMetadataProvider';
import { File3dFormat } from '../types';
import { Mock } from 'moq.ts';

describe(CdfModelMetadataProvider.name, () => {
  const baseUrl = 'https://api.cognitedata.com';
  const project = 'my-project';

  let modelIdentifier: CdfModelIdentifier;
  let provider: CdfModelMetadataProvider;

  beforeEach(async () => {
    modelIdentifier = new CdfModelIdentifier(1337, 42);

    const mockedClient = new Mock<CogniteClient>()
      .setup(c => c.getBaseUrl())
      .returns(baseUrl)
      .setup(c => c.project)
      .returns(project)
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

    const uri = await provider.getModelUriForSignedFiles();

    expect(uri).toEqual(expectedUrl);
  });
});
