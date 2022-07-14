import { DataModelValidationErrorDataMapper } from './data-model-validation-error-data-mapper';

describe('DataModelValidationErrorDataMapper Test', () => {
  const createInstance = () => {
    return new DataModelValidationErrorDataMapper();
  };

  const typeDefsMock = {
    types: [
      {
        name: 'Post',
        fields: [
          {
            name: 'name',
            type: {
              name: 'String',
              list: false,
              nonNull: false,
            },
            nonNull: false,
            directives: [],
            arguments: [],
            location: {
              line: 2,
              column: 9,
            },
          },
          {
            name: 'author',
            type: {
              name: 'Author',
              list: false,
              nonNull: false,
            },
            nonNull: false,
            directives: [],
            arguments: [],
            location: {
              line: 3,
              column: 11,
            },
          },
        ],
        interfaces: [],
        directives: [],
        location: {
          line: 1,
          column: 1,
        },
      },
      {
        name: 'Author',
        fields: [
          {
            name: 'name',
            type: {
              name: 'String',
              list: false,
              nonNull: false,
            },
            nonNull: false,
            directives: [],
            arguments: [],
            location: {
              line: 7,
              column: 9,
            },
          },
        ],
        interfaces: [],
        directives: [],
        location: {
          line: 6,
          column: 1,
        },
      },
    ],
  };

  it('should create instance', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should map to Data Model Validation error from Mixer API validation errors', () => {
    const service = createInstance();
    const errorFromMixerApi = {
      message: 'Invalid field type Authors for field Post.author',
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
    };
    const validationError = service.deserialize(
      errorFromMixerApi,
      typeDefsMock
    );

    expect(validationError).toEqual({
      ...errorFromMixerApi,
      fieldName: 'author',
      typeName: 'Post',
      locations: [
        {
          line: 3,
          column: 11,
        },
      ],
    });
  });

  it('should match type and field names from different error formats', () => {
    const service = createInstance();
    const errorFromMixerApi = {
      message: 'Invalid field type Authors for field Post.author',
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
    };
    let validationError = service.deserialize(errorFromMixerApi, typeDefsMock);

    expect(validationError).toEqual(
      expect.objectContaining({
        fieldName: 'author',
        typeName: 'Post',
      })
    );

    validationError = service.deserialize(
      {
        ...errorFromMixerApi,
        message: 'Unsupported type for field: Post.author',
      },
      typeDefsMock
    );

    expect(validationError).toEqual(
      expect.objectContaining({
        fieldName: 'author',
        typeName: 'Post',
      })
    );

    validationError = service.deserialize(
      {
        ...errorFromMixerApi,
        message: 'Field "Post.author" can only be defined once.',
      },
      typeDefsMock
    );

    expect(validationError).toEqual(
      expect.objectContaining({
        fieldName: 'author',
        typeName: 'Post',
      })
    );
  });

  it('should map to Data Model Validation error from Mixer API breaking changes errors', () => {
    const service = createInstance();
    const errorFromMixerApi = {
      message:
        "The field 'author' on type 'Post' was before none-repeatable and is now repeatable",
      breakingChangeInfo: {
        typeOfChange: 'FIELD_TYPE_CHANGED',
        typeName: 'Post',
        fieldName: 'author',
        previousValue: 'Author',
        currentValue: '[Author]',
      },
    };
    const validationError = service.deserialize(
      errorFromMixerApi,
      typeDefsMock
    );

    expect(validationError).toEqual({
      ...errorFromMixerApi,
      fieldName: 'author',
      typeName: 'Post',
      locations: [
        {
          line: 3,
          column: 11,
        },
      ],
    });
  });

  it('should map to Data Model Validation error from Mixer API breaking changes when they are in extensions', () => {
    const service = createInstance();
    const errorFromMixerApi = {
      message:
        "The field 'author' on type 'Post' was before none-repeatable and is now repeatable",
      extensions: {
        classification: 'VALIDATION',
        breakingChangeInfo: {
          typeOfChange: 'FIELD_TYPE_CHANGED',
          typeName: 'Post',
          fieldName: 'author',
          previousValue: 'Author',
          currentValue: '[Author]',
        },
      },
    };
    const validationError = service.deserialize(
      errorFromMixerApi,
      typeDefsMock
    );

    expect(validationError).toEqual({
      ...errorFromMixerApi,
      fieldName: 'author',
      typeName: 'Post',
      locations: [
        {
          line: 3,
          column: 11,
        },
      ],
    });
  });
});
