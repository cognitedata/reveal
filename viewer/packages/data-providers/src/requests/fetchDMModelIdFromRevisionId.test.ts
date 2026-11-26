/*!
 * Copyright 2026 Cognite AS
 */
import type { CogniteClient, HttpResponse } from '@cognite/sdk';
import { It, Mock } from 'moq.ts';
import { fetchDMModelIdFromRevisionId } from './fetchDMModelIdFromRevisionId';

describe(fetchDMModelIdFromRevisionId.name, () => {
  const revisionSpace = 'my-space';
  const revisionQueryResponse: HttpResponse<unknown> = {
    status: 200,
    headers: {},
    data: {
      items: {
        revision: [
          {
            properties: {
              cdf_cdm: {
                'Cognite3DRevision/v1': { model3D: { externalId: 'cog_3d_model_789', space: revisionSpace } }
              }
            }
          }
        ]
      }
    }
  };

  test('runs at most 4 lookups at the same time', async () => {
    const pendingResponses: Array<PromiseWithResolvers<HttpResponse<unknown>>> = [];
    const sdk = new Mock<CogniteClient>()
      .setup(client => client.getBaseUrl())
      .returns('https://api.cognitedata.com')
      .setup(client => client.project)
      .returns('my-project')
      .setup(client => client.post(It.IsAny(), It.IsAny()))
      .callback(() => {
        const pendingResponse = Promise.withResolvers<HttpResponse<unknown>>();
        pendingResponses.push(pendingResponse);
        return pendingResponse.promise;
      })
      .object();

    const lookups = [1, 2, 3, 4, 5, 6].map(revisionId =>
      fetchDMModelIdFromRevisionId(`cog_3d_revision_${revisionId}`, revisionSpace, sdk)
    );
    await Promise.resolve();
    expect(pendingResponses).toHaveLength(4);

    pendingResponses[0].resolve(revisionQueryResponse);
    await lookups[0];
    expect(pendingResponses).toHaveLength(5);

    pendingResponses.forEach(pendingResponse => pendingResponse.resolve(revisionQueryResponse));
    await vi.waitFor(() => expect(pendingResponses).toHaveLength(6));
    pendingResponses[5].resolve(revisionQueryResponse);
    await expect(Promise.all(lookups)).resolves.toHaveLength(6);
  });
});
