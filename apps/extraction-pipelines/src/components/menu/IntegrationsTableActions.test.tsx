import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/test';
import IntegrationsTableActions from './IntegrationsTableActions';
import { mockResponse } from '../../utils/mockResponse';

describe('IntegrationsTableOptions', () => {
  const actionsMenuLabel = /Actions for/i;
  const integration = mockResponse[0];
  test('should render options', () => {
    render(<IntegrationsTableActions integration={integration} />);
    const menuBtn = screen.getByLabelText(actionsMenuLabel);
    fireEvent.click(menuBtn);
    const menuHeading = screen.getByText(/actions/i);
    expect(menuHeading).toBeInTheDocument();
  });

  const cases = [
    {
      desc: 'Render menu item View integration details',
      expected: 'View integration details',
    },
  ];
  cases.forEach(({ desc, expected }) => {
    test(`${desc}`, () => {
      render(<IntegrationsTableActions integration={integration} />);
      const menuBtn = screen.getByLabelText(actionsMenuLabel);
      fireEvent.click(menuBtn);
      const menuItem = screen.getByText(expected);
      expect(menuItem).toBeInTheDocument();
    });
  });

  test('Render integration details modal on click "View integration detail" action', () => {
    render(<IntegrationsTableActions integration={integration} />);
    const menuBtn = screen.getByLabelText(actionsMenuLabel);
    fireEvent.click(menuBtn);
    const viewIntegrationDetailsAction = screen.getByText(cases[0].expected);
    fireEvent.click(viewIntegrationDetailsAction);
    const modal = screen.getByTestId('view-integration-details-modal');
    expect(modal).toBeInTheDocument();
  });
});
