import { screen } from '@testing-library/react';
import { Store } from 'redux';

import { storage } from '@cognite/react-container';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { useTenantConfig, useTenantConfigByKey } from 'hooks/useTenantConfig';
import { WELL_SELECTED_RELATED_DOCUMENTS_COLUMNS } from 'modules/wellInspect/actions';

import { Search } from './Search';

jest.mock('modules/map/useMapCache', () => ({
  MapCache: () => <></>,
}));

jest.mock('hooks/useTenantConfig', () => ({
  useTenantConfig: jest.fn(),
  useTenantConfigByKey: jest.fn(),
}));

const page = (store: Store) => testRenderer(Search, store);

const defaultTestInit = async () => {
  const store = getMockedStore({
    resultPanel: { panelWidth: 1920 },
  });
  return { ...page(store) };
};

const mockUseTenantConfig = (returnValue: any) =>
  (useTenantConfig as jest.Mock).mockImplementation(() => returnValue);

const mockUseTenantConfigByKey = (returnValue: any) =>
  (useTenantConfigByKey as jest.Mock).mockImplementation(() => returnValue);

describe('Search -> !tenantConfig', () => {
  beforeEach(() => {
    mockUseTenantConfig({ data: undefined });
    mockUseTenantConfigByKey({ data: {} });
  });

  it('should not render the search content without `tenantConfig`', async () => {
    await defaultTestInit();
    expect(screen.queryByTestId('search-container')).not.toBeInTheDocument();
  });
});

describe('Search -> usual behaviour', () => {
  beforeEach(() => {
    mockUseTenantConfig({ data: {} });
    mockUseTenantConfigByKey({ data: {} });
  });

  it('should render the search content as expected', async () => {
    storage.setItem(WELL_SELECTED_RELATED_DOCUMENTS_COLUMNS, {});
    await defaultTestInit();
    expect(screen.getByTestId('search-container')).toBeInTheDocument();
  });
});
