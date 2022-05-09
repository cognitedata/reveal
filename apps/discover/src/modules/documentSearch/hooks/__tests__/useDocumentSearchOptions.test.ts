import '__mocks/mockCogniteSDK';
import { setupServer } from 'msw/node';
import { getMockDocumentSearch } from 'services/documentSearch/__mocks/getMockDocumentSearch';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';

import { renderHookWithStore } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { PartialStoreState } from 'core/types';

import { useDocumentSearchOptions } from '../useDocumentSearchOptions';

const mockServer = setupServer(getMockDocumentSearch(), getMockConfigGet());

describe('useDocumentSearchOptions hook', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  const filter = {};

  const getHookResult = (store: PartialStoreState) => {
    const { result, waitForNextUpdate } = renderHookWithStore(
      () => useDocumentSearchOptions(),
      getMockedStore(store)
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return `documentSearchOptions` when `extractParentFolderPath` is undefined', () => {
    const options = getHookResult({
      resultPanel: {
        sortBy: {},
      },
    });
    expect(options).toEqual({
      filter,
      sort: [],
    });
  });

  it('should return `extractParentFolderOptions` when `extractParentFolderPath` is defined', () => {
    const options = getHookResult({
      resultPanel: { sortBy: {} },
      documentSearch: { extractParentFolderPath: '/extractParentFolderPath' },
    });
    expect(options).toEqual({
      filter: {
        and: [
          {
            prefix: {
              property: ['sourceFile', 'directory'],
              value: '/extractParentFolderPath',
            },
          },
        ],
      },
      sort: [],
    });
  });
});
