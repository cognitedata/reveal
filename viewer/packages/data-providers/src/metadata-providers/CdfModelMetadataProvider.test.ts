/*!
 * Copyright 2021 Cognite AS
 */

import type { CogniteClient } from '@cognite/sdk';
import { HttpError } from '@cognite/sdk';
import { CdfModelIdentifier } from '../model-identifiers/CdfModelIdentifier';
import { DMModelIdentifier } from '../model-identifiers/DMModelIdentifier';
import { CdfModelMetadataProvider } from './CdfModelMetadataProvider';
import { File3dFormat } from '../types';
import { It, Mock, Times } from 'moq.ts';

describe(CdfModelMetadataProvider.name, () => {
  const baseUrl = 'https://api.cognitedata.com';
  const project = 'my-project';
  const expectedSignedFilesUrl = `${baseUrl}/api/v1/projects/${project}/3d/output/files`;

  let modelIdentifier: CdfModelIdentifier;
  let dmModelIdentifier: DMModelIdentifier;

  function createClientMock(): Mock<CogniteClient> {
    return new Mock<CogniteClient>()
      .setup(c => c.getBaseUrl())
      .returns(baseUrl)
      .setup(c => c.project)
      .returns(project);
  }

  beforeEach(async () => {
    modelIdentifier = new CdfModelIdentifier(1337, 42);
    dmModelIdentifier = new DMModelIdentifier({
      modelId: 1337,
      revisionId: 42,
      revisionExternalId: 'my-revision',
      revisionSpace: 'my-space'
    });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  test('getModelUri returns correct URL for a valid output', async () => {
    const provider = new CdfModelMetadataProvider(createClientMock().object());
    const formatMetadata = { format: File3dFormat.GltfCadModel, version: 9, blobId: 1 };
    const expectedUrl = `${baseUrl}/api/v1/projects/${project}/3d/files/${formatMetadata.blobId}`;

    const uri = await provider.getModelUri(modelIdentifier, formatMetadata);

    expect(uri).toEqual(expectedUrl);
  });

  test('getModelUriForSignedFiles returns the endpoint URL when the backend accepts the probe request', async () => {
    const clientMock = createClientMock()
      .setup(c => c.post(It.IsAny(), It.IsAny()))
      .returnsAsync({} as any);
    const provider = new CdfModelMetadataProvider(clientMock.object());

    const uri = await provider.getModelUriForSignedFiles(dmModelIdentifier);

    expect(uri).toEqual(expectedSignedFilesUrl);
  });

  test('getModelUriForSignedFiles returns undefined when the backend request fails', async () => {
    const clientMock = createClientMock()
      .setup(c => c.post(It.IsAny(), It.IsAny()))
      .throwsAsync(new HttpError(404, { error: { code: 404, message: 'Not found' } }, {}));
    const provider = new CdfModelMetadataProvider(clientMock.object());

    const uri = await provider.getModelUriForSignedFiles(dmModelIdentifier);

    expect(uri).toBeUndefined();
  });

  test('getModelUriForSignedFiles only probes the backend once and caches the result', async () => {
    const clientMock = createClientMock()
      .setup(c => c.post(It.IsAny(), It.IsAny()))
      .returnsAsync({} as any);
    const provider = new CdfModelMetadataProvider(clientMock.object());

    await provider.getModelUriForSignedFiles(dmModelIdentifier);
    await provider.getModelUriForSignedFiles(dmModelIdentifier);

    clientMock.verify(c => c.post(It.IsAny(), It.IsAny()), Times.Once());
  });
});
