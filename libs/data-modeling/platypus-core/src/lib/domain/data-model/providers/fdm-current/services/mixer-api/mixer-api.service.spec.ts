import { MixerApiService } from './mixer-api.service';

const postFnMock = jest.fn();
const cdfClientMock = {
  project: 'test',
  post: postFnMock,
} as any;

describe('mixer-api-service test', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const createInstance = () => {
    return new MixerApiService(cdfClientMock);
  };

  it('should create instance', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should validate data model', async () => {
    postFnMock.mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          data: {
            validateApiVersionFromGraphQl: [],
          },
        },
      })
    );
    const service = createInstance();

    const reqDto = {
      apiExternalId: 'test',
      graphQl: 'type Test { name }',
    };
    const response = await service.validateDataModel(reqDto, 'PATCH');
    expect(response).toEqual([]);
  });

  it('should validate data model and return errors', async () => {
    const errors = [
      {
        message: 'Unsupported type for field: Comment.post',
        locations: [
          {
            line: 2,
            column: 9,
          },
        ],
        path: ['validateApiVersionFromGraphQl'],
        extensions: {
          classification: 'DataFetchingException',
        },
      },
    ];

    postFnMock.mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          errors: errors,
          data: null,
        },
      })
    );
    const service = createInstance();

    const reqDto = {
      apiExternalId: 'test',
      graphQl: 'type Test { name }',
    };
    const response = await service.validateDataModel(reqDto, 'PATCH');
    expect(response).toEqual(errors);
  });

  it('should validate data model and return breaking changes as errors', async () => {
    const errors = [
      {
        message:
          "The field 'user' on type 'UserJob' was before none-repeatable and is now repeatable",
        breakingChangeInfo: {
          typeOfChange: 'FIELD_TYPE_CHANGED',
          typeName: 'UserJob',
          fieldName: 'user',
          previousValue: 'User',
          currentValue: '[User]',
        },
      },
    ];

    postFnMock.mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          data: {
            validateApiVersionFromGraphQl: errors,
          },
        },
      })
    );
    const service = createInstance();

    const reqDto = {
      apiExternalId: 'test',
      graphQl: 'type Test { name }',
    };
    const response = await service.validateDataModel(reqDto, 'PATCH');
    expect(response).toEqual(errors);
  });
});
