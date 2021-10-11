import { screen, within } from '@testing-library/react';
import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { useTenantConfig, useTenantConfigByKey } from 'hooks/useTenantConfig';
import { initialState } from 'modules/sidebar/reducer';
import { CategorySwitch } from 'pages/authorized/search/search/SideBar/components/CategorySwitch';
import defaultConfig from 'tenants/config';

jest.mock('hooks/useTenantConfig', () => ({
  useTenantConfig: jest.fn(() => {
    return {
      seismic: {},
    };
  }),
  useTenantConfigByKey: jest.fn(() => {
    return {
      azureConfig: {},
    };
  }),
}));

describe('CategorySwitch', () => {
  const page = (store: Store) => testRenderer(CategorySwitch, store);

  const defaultTestInit = async () =>
    page(
      getMockedStore({ sidebar: { ...initialState, category: 'documents' } })
    );

  it('should display the selected category with a check icon', async () => {
    (useTenantConfig as jest.Mock).mockImplementation(() => ({
      data: { ...defaultConfig, seismic: { disabled: true } },
    }));
    (useTenantConfigByKey as jest.Mock).mockImplementation(() => ({
      azureConfig: {},
    }));

    await defaultTestInit();

    const menuButton = screen.getByLabelText('Filter Categories');
    menuButton.click();

    const menu = screen.getByRole('tooltip');
    const documentItem = within(menu).getByText('Documents');

    const svgItem = within(documentItem).getByTestId('svg-wrapper');
    expect(svgItem).toBeInTheDocument();
  });

  it('should display correct number of options according to tenant config', async () => {
    (useTenantConfig as jest.Mock).mockImplementation(() => ({
      data: { ...defaultConfig, seismic: { disabled: true } },
    }));
    (useTenantConfigByKey as jest.Mock).mockImplementation(() => ({
      azureConfig: {},
    }));

    await defaultTestInit();

    const menuButton = screen.getByLabelText('Filter Categories');
    menuButton.click();

    const menu = screen.getByRole('tooltip');
    expect(within(menu).getAllByRole('button').length).toEqual(2);
    expect(within(menu).getByText('Documents')).toBeInTheDocument();
    expect(within(menu).getByText('Wells')).toBeInTheDocument();
    expect(within(menu).queryByText('Seismic')).not.toBeInTheDocument();
  });
});
