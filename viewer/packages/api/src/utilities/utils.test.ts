/*!
 * Copyright 2026 Cognite AS
 */
import type { CogniteClient, HttpResponse } from '@cognite/sdk';
import type { IMock } from 'moq.ts';
import { It, Mock, Times } from 'moq.ts';
import type { DataSourceType } from '@reveal/data-providers';
import type { AddModelOptions } from '../public/migration/types';
import type { LocalAddModelOptions } from '../../../data-providers/src/utilities/internalAddModelOptions';
import { getModelAndRevisionId } from './utils';

describe(getModelAndRevisionId.name, () => {
  const modelId = 123;
  const revisionId = 456;
  const lookedUpModelId = 789;
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
                'Cognite3DRevision/v1': {
                  model3D: { externalId: `cog_3d_model_${lookedUpModelId}`, space: revisionSpace }
                }
              }
            }
          }
        ]
      }
    }
  };

  let sdkMock: IMock<CogniteClient>;
  let sdk: CogniteClient;

  function expectLookups(times: Times): void {
    sdkMock.verify(client => client.post(It.IsAny(), It.IsAny()), times);
  }

  beforeEach(() => {
    sdkMock = new Mock<CogniteClient>()
      .setup(client => client.getBaseUrl())
      .returns('https://api.cognitedata.com')
      .setup(client => client.project)
      .returns('my-project')
      .setup(client => client.post(It.IsAny(), It.IsAny()))
      .returns(Promise.resolve(revisionQueryResponse));
    sdk = sdkMock.object();
  });

  test('returns the ids of classic options', async () => {
    const options: AddModelOptions<DataSourceType> = { modelId, revisionId };

    await expect(getModelAndRevisionId(options, sdk)).resolves.toEqual({ modelId, revisionId });
    expectLookups(Times.Never());
  });

  test('returns placeholder ids for local options', async () => {
    const options: LocalAddModelOptions = { localPath: 'some/path' };

    await expect(getModelAndRevisionId(options, sdk)).resolves.toEqual({ modelId: -1, revisionId: -1 });
    expectLookups(Times.Never());
  });

  test('looks up the ids of data modeling options', async () => {
    const options: AddModelOptions<DataSourceType> = {
      revisionExternalId: `cog_3d_revision_${revisionId}`,
      revisionSpace
    };

    await expect(getModelAndRevisionId(options, sdk)).resolves.toEqual({ modelId: lookedUpModelId, revisionId });
    expectLookups(Times.Once());
  });

  test('uses the classic ids given with data modeling options without a lookup', async () => {
    const options: AddModelOptions<DataSourceType> = {
      revisionExternalId: `cog_3d_revision_${revisionId}`,
      revisionSpace,
      modelId,
      revisionId
    };

    await expect(getModelAndRevisionId(options, sdk)).resolves.toEqual({ modelId, revisionId });
    expectLookups(Times.Never());
  });

  test('looks up the ids when the given classic ids do not belong to the data modeling revision', async () => {
    const options: AddModelOptions<DataSourceType> = {
      revisionExternalId: `cog_3d_revision_${revisionId + 1}`,
      revisionSpace,
      modelId,
      revisionId
    };

    await expect(getModelAndRevisionId(options, sdk)).resolves.toEqual({
      modelId: lookedUpModelId,
      revisionId: revisionId + 1
    });
    expectLookups(Times.Once());
  });
});
