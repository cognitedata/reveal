import React from 'react';
import { render } from 'utils/test';
import { screen } from '@testing-library/react';
import { Base } from './Home.stories';

describe('<Home />', () => {
  test('renders Suitebar', async () => {
    render(<Base />);
    expect(await screen.findByText(/Executive overview/i)).toBeInTheDocument();
  });
});
