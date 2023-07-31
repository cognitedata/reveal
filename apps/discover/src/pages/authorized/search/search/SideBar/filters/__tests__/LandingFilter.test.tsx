import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { useProjectConfig } from 'hooks/useProjectConfig';

import { LandingFilter } from '../LandingFilter';

jest.mock('hooks/useGlobalMetrics', () => ({
  useGlobalMetrics: jest.fn(),
}));

jest.mock('../SeismicFilter', () => ({
  SeismicFilter: {
    Title: () => <div>SeismicFilter</div>,
  },
}));

jest.mock('../well/WellFilters', () => ({
  WellsFilter: {
    Title: () => <div>WellsFilter</div>,
  },
}));

jest.mock('hooks/useProjectConfig', () => ({
  useProjectConfig: jest.fn(),
}));

jest.mock('../DocumentFilter', () => ({
  DocumentFilter: {
    Title: () => <div>DocumentFilterTitle</div>,
  },
}));

describe('Landing Filter', () => {
  afterAll(jest.clearAllMocks);
  beforeEach(jest.clearAllMocks);

  const defaultTestInit = async (prop: boolean) => {
    const store = getMockedStore({
      sidebar: {
        isOpen: prop,
      },
    });
    return testRenderer(LandingFilter, store);
  };

  it('should not render anything when `projectConfig` is null even if `isOpen` is true', async () => {
    (useProjectConfig as jest.Mock).mockImplementation(() => ({ data: null }));
    await defaultTestInit(true);

    expect(screen.queryByText('DocumentFilterTitle')).not.toBeInTheDocument();
  });

  it('should render document filter title when `isOpen` is true `projectConfig` not equals to null', async () => {
    (useProjectConfig as jest.Mock).mockImplementation(() => ({
      data: {
        wells: { disabled: true },
        seismic: { disabled: true },
      },
    }));

    await defaultTestInit(true);
    expect(screen.getByText('DocumentFilterTitle')).toBeInTheDocument();
  });

  it('should not render document filter when `isOpen` is false and `projectConfig` not equals to null', async () => {
    (useProjectConfig as jest.Mock).mockImplementation(() => ({ data: {} }));

    await defaultTestInit(false);
    expect(screen.queryByText('DocumentFilterTitle')).not.toBeInTheDocument();
  });

  it('should render wells filter title when `projectConfig.wells.disabled` is false and `isOpen` is true', async () => {
    (useProjectConfig as jest.Mock).mockImplementation(() => ({
      data: {
        wells: { disabled: false },
      },
    }));

    await defaultTestInit(true);
    expect(screen.getByText('WellsFilter')).toBeInTheDocument();
  });

  it('should not render wells filter title when `projectConfig.wells.disabled` is true and `isOpen` is true', async () => {
    (useProjectConfig as jest.Mock).mockImplementation(() => ({
      data: {
        wells: { disabled: true },
      },
    }));

    await defaultTestInit(true);
    expect(screen.queryByText('WellsFilter')).not.toBeInTheDocument();
  });

  it('should render seismic filter title when `projectConfig.seismic.disabled` is false and `isOpen` is true', async () => {
    (useProjectConfig as jest.Mock).mockImplementation(() => ({
      data: {
        seismic: { disabled: false },
      },
    }));

    await defaultTestInit(true);
    expect(screen.getByText('SeismicFilter')).toBeInTheDocument();
  });

  it('should not render seismic filter title when `projectConfig.seismic.disabled` is true and `isOpen` is true', async () => {
    (useProjectConfig as jest.Mock).mockImplementation(() => ({
      data: {
        seismic: { disabled: true },
      },
    }));

    await defaultTestInit(true);
    expect(screen.queryByText('SeismicFilter')).not.toBeInTheDocument();
  });
});
