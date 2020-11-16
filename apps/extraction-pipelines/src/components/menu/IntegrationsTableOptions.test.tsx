import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/test';
import IntegrationsTableOptions from './IntegrationsTableOptions';
import { mockResponse } from '../../utils/mockResponse';

describe('IntegrationsTableOptions', () => {
  const actionsMenuLabel = /Actions for/i;
  const integration = mockResponse[0];
  test('should render options', () => {
    render(<IntegrationsTableOptions integration={integration} />);
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
    {
      desc: 'Render menu item Update integration',
      expected: 'Update integration',
    },
    {
      desc: 'Render menu item View data stream and source',
      expected: 'View data stream and source',
    },
    {
      desc: 'Render menu item Download configuration',
      expected: 'Download configuration',
    },
  ];
  cases.forEach(({ desc, expected }) => {
    test(`${desc}`, () => {
      render(<IntegrationsTableOptions integration={integration} />);
      const menuBtn = screen.getByLabelText(actionsMenuLabel);
      fireEvent.click(menuBtn);
      const menuItem = screen.getByText(expected);
      expect(menuItem).toBeInTheDocument();
    });
  });

  test('Render integration details modal on click "View integration detail" action', () => {
    render(<IntegrationsTableOptions integration={integration} />);
    const menuBtn = screen.getByLabelText(actionsMenuLabel);
    fireEvent.click(menuBtn);
    const viewIntegrationDetailsAction = screen.getByText(cases[0].expected);
    fireEvent.click(viewIntegrationDetailsAction);
    const modal = screen.getByTestId('view-integration-details-modal');
    expect(modal).toBeInTheDocument();
  });
});
