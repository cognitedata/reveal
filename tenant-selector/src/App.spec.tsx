import React from 'react';
import { render, screen } from '@testing-library/react';

import { App } from './App';

jest.mock('@cognite/react-tenant-selector', () => ({
  TenantSelector: () => <div>test</div>,
}));

describe('<App />', () => {
  test('renders base page', async () => {
    render(<App />);
    expect(await screen.findByText(/test/i)).toBeInTheDocument();
  });
});
