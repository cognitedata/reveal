import { FdmMixerApiService } from './fdm-mixer-api.service';

const postFnMock = jest.fn();
const cdfClientMock = {
  project: 'test',
  post: postFnMock,
} as any;

describe('fdm-mixer-api-service test', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const createInstance = () => {
    return new FdmMixerApiService(cdfClientMock);
  };

  it('should create instance', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it.skip('should validate data model', async () => {
    const DmlVersion = {
      space: 'test-space',
      externalId: 'test-external-id',
      version: '1',
      graphQl: 'type Test { name }',
    };
    const { space, ...DmlVersionResult } = DmlVersion;

    postFnMock.mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          result: DmlVersionResult,
        },
      })
    );

    const service = createInstance();

    const reqDto = DmlVersion;
    const response = await service.validateVersion(reqDto);
    console.log(response);
    expect(response).toEqual(DmlVersionResult);
  });
});
