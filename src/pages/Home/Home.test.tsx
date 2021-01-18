import React from 'react';
import { screen } from '@testing-library/react';

import { render } from 'utils/test';

import { Base } from './Home.stories';

describe('<Home />', () => {
  test('renders learn react link', async () => {
    render(<Base />);
    expect(await screen.findByText(/learn about/i)).toBeInTheDocument();
  });
});
