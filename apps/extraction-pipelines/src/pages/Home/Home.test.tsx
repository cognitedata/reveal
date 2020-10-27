import React from 'react';
import { render } from 'utils/test';
import Home from './Home';

describe('<Home />', () => {
  test('Renders Home page', async () => {
    const { getByText } = render(<Home />);
    const linkElement = getByText(/Integrations/i);
    expect(linkElement).toBeInTheDocument();
  });
});
