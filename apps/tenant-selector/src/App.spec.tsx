import { render, screen } from '@testing-library/react';

import { App } from './App';

jest.mock('@cognite/react-tenant-selector', () => ({
  // eslint-disable-next-line react/display-name
  TenantSelector: () => <div>test</div>,
}));

describe('<App />', () => {
  test('renders base page', async () => {
    render(<App />);
    expect(await screen.findByText(/test/i)).toBeInTheDocument();
  });
});
