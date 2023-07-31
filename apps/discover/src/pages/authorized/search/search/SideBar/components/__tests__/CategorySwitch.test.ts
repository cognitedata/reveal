import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import {
  useProjectConfig,
  useProjectConfigByKey,
} from 'hooks/useProjectConfig';
import { initialState } from 'modules/sidebar/reducer';
import { Modules } from 'modules/sidebar/types';
import { CategorySwitch } from 'pages/authorized/search/search/SideBar/components/CategorySwitch';

jest.mock('hooks/useProjectConfig', () => ({
  useProjectConfig: jest.fn(() => {
    return {
      seismic: {},
    };
  }),
  useProjectConfigByKey: jest.fn(() => {
    return {
      azureConfig: {},
    };
  }),
}));

describe('CategorySwitch', () => {
  const page = (store: Store) => testRenderer(CategorySwitch, store);

  const defaultTestInit = async () =>
    page(
      getMockedStore({
        sidebar: {
          ...initialState,
          category: 'documents' as Modules.DOCUMENTS,
        },
      })
    );

  it('should display the selected category with a check icon', async () => {
    (useProjectConfig as jest.Mock).mockImplementation(() => ({
      data: {
        documents: { disabled: false },
        wells: { disabled: false },
        seismic: { disabled: true },
      },
    }));
    (useProjectConfigByKey as jest.Mock).mockImplementation(() => ({
      azureConfig: {},
    }));

    await defaultTestInit();

    const menuButton = screen.getByLabelText('Filter Categories');
    await userEvent.click(menuButton);

    const menu = screen.getByRole('tooltip');
    const documentItem = within(menu).getByText('Documents');

    const svgItem = within(documentItem).getByTestId('svg-wrapper');
    expect(svgItem).toBeInTheDocument();
  });

  it('should display correct number of options according to tenant config', async () => {
    (useProjectConfig as jest.Mock).mockImplementation(() => ({
      data: {
        documents: { disabled: false },
        wells: { disabled: false },
        seismic: { disabled: true },
      },
    }));
    (useProjectConfigByKey as jest.Mock).mockImplementation(() => ({
      azureConfig: {},
    }));

    await defaultTestInit();

    const menuButton = screen.getByLabelText('Filter Categories');
    await userEvent.click(menuButton);

    const menu = screen.getByRole('tooltip');
    expect(within(menu).getAllByRole('button').length).toEqual(2);
    expect(within(menu).getByText('Documents')).toBeInTheDocument();
    expect(within(menu).getByText('Wells')).toBeInTheDocument();
    expect(within(menu).queryByText('Seismic')).not.toBeInTheDocument();
  });
});
