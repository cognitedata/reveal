import { screen, fireEvent } from '@testing-library/react';
import noop from 'lodash/noop';
import { useSetWellsFilters } from 'services/savedSearches/hooks/useClearWellsFilters';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import { FIELD_BLOCK_OPERATOR } from 'modules/wellSearch/constantsSidebarFilters';
import { defaultWellsConfig } from 'tenants/config';

import { FilterCategoryValues } from '../FilterCategoryValues';

jest.mock('services/savedSearches/hooks/useClearWellsFilters', () => ({
  useSetWellsFilters: jest.fn(),
}));

jest.mock('hooks/useProjectConfig', () => ({
  useProjectConfigByKey: jest.fn(),
}));

describe('FilterCategoryValues', () => {
  beforeEach(() => {
    (useSetWellsFilters as jest.Mock).mockImplementation(() => noop);
    (useProjectConfigByKey as jest.Mock).mockImplementation((key: string) => {
      switch (key) {
        case 'wells':
          return {
            data: {
              overview: {
                enabled: true,
              },
              data_source_filter: {
                enabled: true,
              },
              nds: {
                enabled: true,
              },
              npt: {
                enabled: true,
              },
              field_block_operator_filter: {
                field: {
                  enabled: true,
                },
                region: {
                  enabled: true,
                },
                block: {
                  enabled: true,
                },
                operator: {
                  enabled: true,
                },
              },
              well_characteristics_filter: {
                md: {
                  enabled: true,
                },
                kb_elevation: {
                  enabled: true,
                },
                tvd: {
                  enabled: true,
                },
                dls: {
                  enabled: true,
                  feetDistanceInterval: 30,
                  meterDistanceInterval: 100,
                },
              },
              trajectory: defaultWellsConfig.wells?.trajectory,
              casing: defaultWellsConfig.wells?.casing,
            },
          };
        case 'general.enableWellSDKV3':
          return {
            data: true,
          };
        default:
          return {
            data: undefined,
          };
      }
    });
  });
  afterEach(() => {
    (useSetWellsFilters as jest.Mock).mockClear();
  });
  const testInit = async (viewProps?: any) =>
    testRenderer(FilterCategoryValues, getMockedStore(), viewProps);

  it('should render category', async () => {
    await testInit();
    expect(await screen.findByText(FIELD_BLOCK_OPERATOR)).toBeInTheDocument();
  });

  it('should render category values', async () => {
    await testInit();
    expect(await screen.findByText('BOEM')).toBeInTheDocument();
    expect(await screen.findByText('BP-Penquin')).toBeInTheDocument();
  });

  it(`should trigger callback on remove click`, async () => {
    await testInit();
    const button = await screen.findAllByTestId('remove-btn');
    fireEvent.click(button[0]);
    expect(useSetWellsFilters).toHaveBeenCalled();
  });
});
