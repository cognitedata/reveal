import { QueryClient } from 'react-query';
import { act, renderHook } from '@testing-library/react-hooks';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import {
  createUpdateSpec,
  mapUpdateToPartialIntegration,
  rootUpdate,
  useDetailsUpdate,
} from 'hooks/details/useDetailsUpdate';
import { renderWithReactQueryCacheProvider } from 'utils/test/render';
import { getMockResponse, mockError } from 'utils/mockResponse';
import { IntegrationUpdateSpec } from 'utils/IntegrationsAPI';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from 'utils/baseURL';

describe('useDetailsUpdate', () => {
  let client;
  let wrapper;
  beforeEach(() => {
    client = new QueryClient();
    client.invalidateQueries = jest.fn();
    client.getQueryCache().find = jest.fn();
    wrapper = renderWithReactQueryCacheProvider(
      client,
      ORIGIN_DEV,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Returns integrations on success', async () => {
    const integrationsResponse = getMockResponse()[1];
    sdkv3.post.mockResolvedValue({ data: { items: [integrationsResponse] } });

    const { result } = renderHook(() => useDetailsUpdate(), {
      wrapper,
    });
    const { mutateAsync } = result.current;
    const id = 1;
    const items = [
      {
        id,
        update: {},
      },
    ];
    expect(client.getQueryCache().find).toHaveBeenCalledTimes(0);
    await act(() => {
      return mutateAsync({ project: PROJECT_ITERA_INT_GREEN, items, id });
    });
    expect(result.current.data.name).toEqual(integrationsResponse.name);
    expect(client.invalidateQueries).toHaveBeenCalledTimes(1);
  });

  test('Returns error on fail', async () => {
    sdkv3.post.mockRejectedValue(mockError);

    const { result } = renderHook(() => useDetailsUpdate(), {
      wrapper,
    });
    const { mutateAsync } = result.current;
    const id = 1;
    const items = [
      {
        id,
        update: {},
      },
    ];
    expect(client.getQueryCache().find).toHaveBeenCalledTimes(0);
    await act(async () => {
      await expect(
        mutateAsync({ project: PROJECT_ITERA_INT_GREEN, items, id })
      ).rejects.toEqual(mockError);
    });
    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeUndefined();
    expect(client.invalidateQueries).toHaveBeenCalledTimes(1);
  });
});

describe('createFieldData', () => {
  const mockIntegration = getMockResponse()[0];
  const newDocumentationField = 'This is the new documentation';
  const meta = {
    project: '',
    fieldName: 'metadata',
    fieldValue: {
      ...mockIntegration.metadata,
      documentation: newDocumentationField,
    },
    id: mockIntegration.id,
  };
  const contacts = {
    project: '',
    fieldName: 'contacts',
    fieldValue: [
      { name: 'test', email: 'test@test.no' },
      { name: 'foo', email: 'foo@test.no' },
    ],
    id: mockIntegration.id,
  };
  const externalId = {
    project: '',
    fieldName: 'externalId',
    fieldValue: 'my_external_id',
    id: mockIntegration.id,
  };
  const cases = [
    {
      desc: 'metadata',
      fields: meta,
      expected: meta.fieldValue,
    },
    {
      desc: 'contacts',
      fields: contacts,
      expected: contacts.fieldValue,
    },
    {
      desc: 'externalId',
      fields: externalId,
      expected: externalId.fieldValue,
    },
  ];
  cases.forEach(({ desc, fields, expected }) => {
    test(`Maps update obj back to partial integration - ${desc}`, () => {
      const res = mapUpdateToPartialIntegration(createUpdateSpec(fields));
      const { fieldName } = fields;
      expect(res[0][fieldName]).toBeDefined();
      expect(res[0][fieldName]).toEqual(expected);
    });
  });
});
describe('createUpdateSpec', () => {
  const spec = [
    { desc: 'Name', id: 2, fieldName: 'name', fieldValue: 'This is a test' },
    {
      desc: 'Description',
      id: 2,
      fieldName: 'description',
      fieldValue: 'This is the description',
    },
    {
      desc: 'Contacts',
      id: 2,
      fieldName: 'contacts',
      fieldValue: [{ name: 'aaa', email: 'aaa@test.no' }],
    },
    {
      desc: 'Not exists fieldName',
      id: 2,
      fieldName: 'thisDoesNotExist',
      fieldValue: 'This does not exist',
    },
  ];
  spec.forEach(({ desc, fieldValue, fieldName, id }) => {
    test(`createUpdateSpec - ${desc}`, () => {
      const res = createUpdateSpec({
        project: 'pro',
        id,
        fieldName,
        fieldValue,
      });
      expect(res.items[0].update[`${fieldName}`]).toBeDefined();
      expect(res.items[0].update[`${fieldName}`].set).toEqual(fieldValue);
    });
  });
});

describe('rootUpdate', () => {
  const mock = getMockResponse()[0];
  const cases = [
    {
      fieldName: 'externalId',
      value: {
        integration: mock,
        name: 'externalId',
        project: PROJECT_ITERA_INT_GREEN,
      },
      field: {
        externalId: 'new_external_id_test',
      },
    },
    {
      fieldName: 'source',
      value: {
        integration: mock,
        name: 'source',
        project: PROJECT_ITERA_INT_GREEN,
      },
      field: {
        source: 'A new Source',
      },
    },
  ];
  cases.forEach(({ value, field, fieldName }) => {
    test('Creates update object', () => {
      const update = rootUpdate(value);
      const res = update(field);
      expect(res.id).toEqual(mock.id);
      expect(res.items[0].update[fieldName].set).toEqual(field[fieldName]);
    });
  });
});
