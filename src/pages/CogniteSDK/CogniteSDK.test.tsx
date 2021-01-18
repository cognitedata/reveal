import React from 'react';
import { screen } from '@testing-library/react';

import { render } from 'utils/test';

import { Base } from './CogniteSDK.stories';

describe('<CogniteSDK />', () => {
  test('renders main page', async () => {
    render(<Base />);
    expect(
      await screen.findByText(/How does Authentication work/i)
    ).toBeInTheDocument();
  });
});
