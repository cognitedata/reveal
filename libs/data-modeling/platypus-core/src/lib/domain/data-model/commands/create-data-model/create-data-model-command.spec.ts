import { PlatypusError } from '../../../../boundaries/types';
import {
  FdmMixerApiService,
  GraphQlDmlVersionDTO,
  SpacesApiService,
} from '../../providers/fdm-next';

import { CreateDataModelCommand } from './create-data-model-command';

describe('FetchDataModelQuery Test', () => {
  const upsertVersionMockFn = jest.fn().mockImplementation(() =>
    Promise.resolve({
      result: {
        externalId: 'external-id',
        space: 'test-space',
        version: '1',
        status: 'PUBLISHED',
        graphQlDml: 'type Post {\n  title: String!\n  views: Int!\n }\n',
        createdTime: 1667260800,
        lastUpdatedTime: 1667260800,
      },
      errors: [],
    })
  );

  const getDataModelVersionsByIdMock = jest.fn(
    (space, dataModelId): Promise<GraphQlDmlVersionDTO[]> => {
      if (dataModelId === 'existingDataModel') {
        return Promise.resolve([
          {
            space: space,
            externalId: 'existingDataModel',
            version: '1',
            name: 'name',
            description: undefined,
            graphQlDml: undefined,
            createdTime: undefined,
            lastUpdatedTime: undefined,
            views: [],
          },
        ]);
      } else {
        return Promise.reject(
          new PlatypusError(
            `Data model with external-id ${dataModelId} does not exist.`,
            'NOT_FOUND',
            404
          )
        );
      }
    }
  );
  const mixerApiServiceMock = {
    upsertVersion: upsertVersionMockFn,
    getDataModelVersionsById: getDataModelVersionsByIdMock,
  } as any as FdmMixerApiService;

  const getSpaceByIdMockFn = jest
    .fn()
    .mockImplementation(() => Promise.resolve({ items: [] }));
  const spacesApiMock = {
    getByIds: getSpaceByIdMockFn,
    upsert: jest.fn().mockImplementation(() => Promise.resolve({ items: [] })),
  } as any as SpacesApiService;

  const createInstance = () => {
    return new CreateDataModelCommand(mixerApiServiceMock, spacesApiMock);
  };

  it('should work', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  test('sends correct payload', async () => {
    getDataModelVersionsByIdMock.mockImplementationOnce(() =>
      Promise.resolve([])
    );
    const createCommand = createInstance();

    await createCommand.execute({
      name: 'Test',
      externalId: 'Test',
      description: 'Test',
      space: 'Test',
    });
    expect(mixerApiServiceMock.upsertVersion).toHaveBeenCalledWith({
      space: 'Test',
      externalId: 'Test',
      name: 'Test',
      description: 'Test',
      version: '1',
    });
  });

  test('throws error if data model with external-id already exists', async () => {
    const createCommand = createInstance();

    const dto = {
      name: 'name',
      externalId: 'existingDataModel',
      space: 'space',
    };

    //Taken from https://stackoverflow.com/a/72004768/8504149
    const throwingFunction = () => createCommand.execute(dto);

    // This is what prevents the test to succeed when the promise is resolved and not rejected
    expect.assertions(2);
    await throwingFunction().catch((error) => {
      expect(error).toBeInstanceOf(PlatypusError);
      expect(error.message).toMatch(
        'Could not create data model. Data model with external-id existingDataModel already exists in space space'
      );
    });
  });
});
