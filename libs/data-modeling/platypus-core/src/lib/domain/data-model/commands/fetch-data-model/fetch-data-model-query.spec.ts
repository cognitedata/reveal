import { FdmMixerApiService } from '../../providers/fdm-next';

import { FetchDataModelQuery } from './fetch-data-model-query';

describe('FetchDataModelQuery Test', () => {
  const getDataModelVersionsByIdMockFn = jest.fn().mockImplementation(() =>
    Promise.resolve([
      {
        externalId: 'dataModelExternalId',
        name: 'test',
        description: 'test',
        space: 'space-id',
        version: '1',
        graphQlDml: 'type Test { name: String }',
        createdTime: 1696118400000,
      },
    ])
  );
  const mixerApiServiceMock = {
    getDataModelVersionsById: getDataModelVersionsByIdMockFn,
  } as any as FdmMixerApiService;

  const createInstance = () => {
    return new FetchDataModelQuery(mixerApiServiceMock);
  };

  it('should work', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should fetch versions for data model ordered descending', async () => {
    const service = createInstance();
    const dto = {
      dataModelId: 'dm-external-id',
      space: 'space-id',
    };
    const dataModel = await service.execute(dto);
    expect(mixerApiServiceMock.getDataModelVersionsById).toBeCalledWith(
      'space-id',
      'dm-external-id'
    );

    expect(dataModel.version).toBe('1');
    expect(dataModel.name).toBe('test');
    expect(dataModel.id).toBe('dataModelExternalId');
  });
});
