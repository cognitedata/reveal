import React from 'react';
import { render } from 'utils/test';
import { screen } from '@testing-library/react';
import { Base } from './Home.stories';

describe('<Home />', () => {
  test('renders learn react link', async () => {
    render(<Base />);
    expect(await screen.findByText(/11-ESDV-90020 Chart/i)).toBeInTheDocument();
  });
});
