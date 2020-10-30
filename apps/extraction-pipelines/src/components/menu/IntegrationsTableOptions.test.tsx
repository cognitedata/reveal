import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/test';
import IntegrationsTableOptions from './IntegrationsTableOptions';
import { mockResponse } from '../../utils/mockResponse';

describe('IntegrationsTableOptions', () => {
  const integration = mockResponse[0];
  test('should render options', () => {
    render(<IntegrationsTableOptions integration={integration} />);
    const menuBtn = screen.getByLabelText(/Options menu/i);
    fireEvent.click(menuBtn);
    const menuHeading = screen.getByText(integration.name);
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
      desc: 'Render menu item Create new dataset',
      expected: 'Create new dataset',
    },
    {
      desc: 'Render menu item Download configuration',
      expected: 'Download configuration',
    },
  ];
  cases.forEach(({ desc, expected }) => {
    test(`${desc}`, () => {
      render(<IntegrationsTableOptions integration={integration} />);
      const menuBtn = screen.getByLabelText(/Options menu/i);
      fireEvent.click(menuBtn);
      const menuItem = screen.getByText(expected);
      expect(menuItem).toBeInTheDocument();
    });
  });
});
