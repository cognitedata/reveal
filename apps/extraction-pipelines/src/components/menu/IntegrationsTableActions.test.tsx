import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/test';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { QueryClient } from 'react-query';
import IntegrationsTableActions, {
  IntegrationAction,
} from './IntegrationsTableActions';
import { getMockResponse } from '../../utils/mockResponse';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
  renderWithReactQueryCacheProvider,
} from '../../utils/test/render';

describe('IntegrationsTableActions', () => {
  const actionsMenuLabel = /Actions for/i;
  const integration = getMockResponse()[0];
  let wrapper = null;
  beforeEach(() => {
    sdkv3.get.mockResolvedValue({ data: getMockResponse()[0] });
    wrapper = renderWithReactQueryCacheProvider(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      CDF_ENV_GREENFIELD
    );
    render(<IntegrationsTableActions integration={integration} />, { wrapper });
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should render options', () => {
    const menuBtn = screen.getByLabelText(actionsMenuLabel);
    fireEvent.click(menuBtn);
    const menuHeading = screen.getByText(/actions/i);
    expect(menuHeading).toBeInTheDocument();
  });

  const cases = [
    {
      desc: 'Render menu item View integration details',
      expected: IntegrationAction.VIEW_EDIT_DETAILS,
    },
  ];
  cases.forEach(({ desc, expected }) => {
    test(`${desc}`, () => {
      const menuBtn = screen.getByLabelText(actionsMenuLabel);
      fireEvent.click(menuBtn);
      const menuItem = screen.getByText(expected);
      expect(menuItem).toBeInTheDocument();
    });
  });

  test('Render integration details modal on click "View integration detail" action', () => {
    const menuBtn = screen.getByLabelText(actionsMenuLabel);
    fireEvent.click(menuBtn);
    const viewIntegrationDetailsAction = screen.getByText(cases[0].expected);
    fireEvent.click(viewIntegrationDetailsAction);
    const modal = screen.getByTestId('view-integration-details-modal');
    expect(modal).toBeInTheDocument();
  });
});
