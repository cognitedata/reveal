import { FdmMixerApiService } from '../../providers/fdm-next';

import { RunGraphqlQuery } from './run-graphql-query';

describe('RunGraphqlQuery Test', () => {
  const mixerApiServiceMock = {
    runQuery: jest.fn().mockImplementation(() => Promise.resolve([])),
  } as any as FdmMixerApiService;

  const createInstance = () => {
    return new RunGraphqlQuery(mixerApiServiceMock);
  };

  it('should work', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should fetch data models', async () => {
    const service = createInstance();
    const dto = {
      dataModelId: 'testExternalId',
      space: 'testSpace',
      schemaVersion: '1',
      graphQlParams: {
        query: `query { listPerson { items { externalId } } }`,
        variables: { limit: 10 },
      },
    };

    await service.execute(dto);
    expect(mixerApiServiceMock.runQuery).toBeCalledWith({
      ...dto,
      extras: {
        apiName: 'testExternalId',
      },
    });
  });
});
