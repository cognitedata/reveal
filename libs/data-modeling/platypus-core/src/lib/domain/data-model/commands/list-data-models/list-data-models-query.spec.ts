import { FdmMixerApiService } from '../../providers/fdm-next';

import { ListDataModelsQuery } from './list-data-models-query';

describe('ListDataModelsQuery Test', () => {
  const mixerApiServiceMock = {
    listDataModelVersions: jest
      .fn()
      .mockImplementation(() => Promise.resolve([])),
  } as any as FdmMixerApiService;

  const createInstance = () => {
    return new ListDataModelsQuery(mixerApiServiceMock);
  };

  it('should work', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should fetch data models', async () => {
    const service = createInstance();
    await service.execute();
    expect(mixerApiServiceMock.listDataModelVersions).toBeCalled();
  });
});
