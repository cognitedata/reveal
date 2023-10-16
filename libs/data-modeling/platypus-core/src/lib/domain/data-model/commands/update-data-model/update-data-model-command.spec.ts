import { FdmMixerApiService } from '../../providers/fdm-next';

import { UpdateDataModelCommand } from './update-data-model-command';
describe('UpdateDataModelCommand Test', () => {
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
  const mixerApiServiceMock = {
    upsertVersion: upsertVersionMockFn,
  } as any as FdmMixerApiService;

  const createInstance = () => {
    return new UpdateDataModelCommand(mixerApiServiceMock);
  };

  it('should work', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should call update with the correct parametars', async () => {
    const createCommand = createInstance();

    await createCommand.execute({
      name: 'Test name',
      externalId: 'testExternalId',
      description: 'Test',
      space: 'testSpace',
      version: '1',
    });
    expect(mixerApiServiceMock.upsertVersion).toHaveBeenCalledWith({
      space: 'testSpace',
      externalId: 'testExternalId',
      name: 'Test name',
      description: 'Test',
      version: '1',
    });
  });
});
