import { screen } from '@testing-library/react';
import { Store } from 'redux';

import { storage } from '@cognite/react-container';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import {
  useProjectConfig,
  useProjectConfigByKey,
} from 'hooks/useProjectConfig';
import { WELL_SELECTED_RELATED_DOCUMENTS_COLUMNS } from 'modules/wellInspect/actions';

import { Search } from './Search';

jest.mock('hooks/useProjectConfig', () => ({
  useProjectConfig: jest.fn(),
  useProjectConfigByKey: jest.fn(),
}));

const page = (store: Store) => testRenderer(Search, store);

const defaultTestInit = async () => {
  const store = getMockedStore({
    resultPanel: { panelWidth: 1920 },
  });
  return { ...page(store) };
};

const mockUseProjectConfig = (returnValue: any) =>
  (useProjectConfig as jest.Mock).mockImplementation(() => returnValue);

const mockUseProjectConfigByKey = (returnValue: any) =>
  (useProjectConfigByKey as jest.Mock).mockImplementation(() => returnValue);

describe('Search -> !projectConfig', () => {
  beforeEach(() => {
    mockUseProjectConfig({ data: undefined });
    mockUseProjectConfigByKey({ data: {} });
  });

  it('should not render the search content without `projectConfig`', async () => {
    await defaultTestInit();
    expect(screen.queryByTestId('search-container')).not.toBeInTheDocument();
  });
});

describe('Search -> usual behaviour', () => {
  beforeEach(() => {
    mockUseProjectConfig({ data: {} });
    mockUseProjectConfigByKey({ data: {} });
  });

  it('should render the search content as expected', async () => {
    storage.setItem(WELL_SELECTED_RELATED_DOCUMENTS_COLUMNS, {});
    await defaultTestInit();
    expect(screen.getByTestId('search-container')).toBeInTheDocument();
  });
});
