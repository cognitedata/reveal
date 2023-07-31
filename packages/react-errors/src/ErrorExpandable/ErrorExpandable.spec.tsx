import { render, screen } from '@testing-library/react';

import { Base } from './ErrorExpandable.stories';

describe('Error', () => {
  it('Renders children', () => {
    render(<Base />);
    screen.getByText('There has been an error');
  });
});
