import React from 'react';
import { render } from '@testing-library/react';

import { Base } from './Error.stories';

describe('Error', () => {
  it('Renders children', () => {
    const { getByText } = render(<Base />);
    getByText(
      'Something is taking longer than usual. Please refresh the page.'
    );
  });
});
