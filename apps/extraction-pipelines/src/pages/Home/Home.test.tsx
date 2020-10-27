import React from 'react';
import { render } from 'utils/test';
import { screen } from '@testing-library/react';
import Home from './Home';

describe('<Home />', () => {
  test('Renders Home page', async () => {
    render(<Home />);
    const linkElement = screen.getByRole('heading');
    expect(linkElement.textContent).toEqual('Integrations');
  });
});
