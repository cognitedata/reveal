import { renderHook } from '@testing-library/react-hooks';

import { useProjectConfig } from 'hooks/useProjectConfig';
import { useExtractParentFolderPath } from 'modules/documentSearch/selectors';
import { useSortByOptions } from 'modules/resultPanel/selectors';

import { useDocumentSearchOptions } from '../useDocumentSearchOptions';

jest.mock('hooks/useProjectConfig', () => ({
  useProjectConfig: jest.fn(),
}));

jest.mock('modules/resultPanel/selectors', () => ({
  useSortByOptions: jest.fn(),
}));

jest.mock('../../selectors', () => ({
  useExtractParentFolderPath: jest.fn(),
}));

describe('useDocumentSearchOptions hook', () => {
  const filters = { testFilter: true };
  const sort = {
    id: 'doc.title',
    desc: true,
  };

  beforeEach(() => {
    (useProjectConfig as jest.Mock).mockImplementation(() => ({
      data: { documents: { filters } },
    }));
    (useSortByOptions as jest.Mock).mockImplementation(() => ({
      documents: [sort],
    }));
  });

  const getHookResult = () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useDocumentSearchOptions()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return `documentSearchOptions` when `extractParentFolderPath` is undefined', () => {
    const options = getHookResult();
    expect(options).toEqual({
      filters,
      sort: [
        {
          order: 'desc',
          property: ['title'],
        },
      ],
    });
  });

  it('should return `extractParentFolderOptions` when `extractParentFolderPath` is defined', () => {
    const extractParentFolderPath = '/extractParentFolderPath';
    (useExtractParentFolderPath as jest.Mock).mockImplementation(
      () => extractParentFolderPath
    );

    const options = getHookResult();
    expect(options).toEqual({
      filters: {
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
