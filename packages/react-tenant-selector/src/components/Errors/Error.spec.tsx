import { render, screen } from '@testing-library/react';

import { Base } from './Error.stories';

describe('Error', () => {
  it('Renders children', () => {
    render(<Base />);
    screen.getByText(
      'Something is taking longer than usual. Please refresh the page.'
    );
  });
});
