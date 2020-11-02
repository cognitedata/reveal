import React from 'react';
import { render } from 'utils/test';
import { screen } from '@testing-library/react';
import Home from './Home';

describe('<Home />', () => {
  test('Renders Home page', async () => {
    render(<Home />);
    const headings = screen.getAllByRole('heading');
    expect(headings[0].textContent).toEqual('Integrations');
    expect(headings.length).toEqual(2);
  });
});
