import { PlatypusError } from '../../../../boundaries/types/platypus-error';
import { FdmMixerApiService, SpacesApiService } from '../../providers/fdm-next';

import { FetchDataModelVersionsQuery } from './fetch-data-model-versions-query';

describe('FetchDataModelVersionsQuery Test', () => {
  const getDataModelVersionsByIdMockFn = jest.fn().mockImplementation(() =>
    Promise.resolve([
      {
        externalId: 'test',
        name: 'test',
        description: 'test',
        space: 'space-id',
        version: '1',
        graphQlDml: 'type Test { name: String }',
        createdTime: 1696118400000,
      },
      {
        externalId: 'test',
        name: 'test',
        description: 'test',
        space: 'space-id',
        version: '2',
        graphQlDml: 'type Test { name: String }',
        createdTime: 1697111292998,
      },
    ])
  );
  const mixerApiServiceMock = {
    getDataModelVersionsById: getDataModelVersionsByIdMockFn,
  } as any as FdmMixerApiService;

  const getSpaceByIdMockFn = jest
    .fn()
    .mockImplementation(() => Promise.resolve({ items: [] }));
  const spacesApiMock = {
    getByIds: getSpaceByIdMockFn,
  } as any as SpacesApiService;

  const createInstance = () => {
    return new FetchDataModelVersionsQuery(mixerApiServiceMock, spacesApiMock);
  };

  it('should work', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should fetch versions for data model ordered descending', async () => {
    const service = createInstance();
    const dto = {
      externalId: 'dm-external-id',
      space: 'space-id',
    };
    const dataModels = await service.execute(dto);
    expect(mixerApiServiceMock.getDataModelVersionsById).toBeCalledWith(
      'space-id',
      'dm-external-id'
    );
    expect(dataModels.length).toBe(2);
    expect(dataModels[0].version).toBe('2');
  });

  it('should filter out data model versions with empty schema', async () => {
    getDataModelVersionsByIdMockFn.mockImplementationOnce(() =>
      Promise.resolve([
        {
          externalId: 'test',
          name: 'test',
          description: 'test',
          space: 'space-id',
          version: '1',
          graphQlDml: '',
        },
      ])
    );
    const service = createInstance();
    const dto = {
      externalId: 'dm-external-id',
      space: 'space-id',
    };
    const dataModels = await service.execute(dto);
    expect(dataModels.length).toBe(0);
  });

  it('should throw error if no results and space does not exist', async () => {
    getDataModelVersionsByIdMockFn.mockImplementationOnce(() =>
      Promise.resolve([])
    );

    const service = createInstance();
    const dto = {
      externalId: 'dm-external-id',
      space: 'space-id',
    };
    // await service.execute(dto);
    expect(service.execute(dto)).rejects.toEqual(
      expect.objectContaining(
        new PlatypusError(
          'Specified space space-id does not exist!',
          'NOT_FOUND'
        )
      )
    );
  });
  it('should throw error if the data model does not exist but data model exists', async () => {
    getDataModelVersionsByIdMockFn.mockImplementationOnce(() =>
      Promise.resolve([])
    );
    getSpaceByIdMockFn.mockImplementationOnce(() =>
      Promise.resolve({ items: [{ externalId: 'test-space' }] })
    );

    const service = createInstance();
    const dto = {
      externalId: 'dm-external-id',
      space: 'space-id',
    };
    // await service.execute(dto);
    expect(service.execute(dto)).rejects.toEqual(
      expect.objectContaining(
        new PlatypusError(
          'Specified data model dm-external-id does not exist!',
          'NOT_FOUND'
        )
      )
    );
  });
});
