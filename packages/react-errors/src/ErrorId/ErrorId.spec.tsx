import React from 'react';
import { render, screen } from '@testing-library/react';

import { Base } from './ErrorId.stories';

describe('ErrorId', () => {
  it('shows a simple error', async () => {
    render(<Base />);
    expect(
      await screen.findByText('Error ID: some-error-id')
    ).toBeInTheDocument();
  });
});
