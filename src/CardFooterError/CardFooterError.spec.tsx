import React from 'react';
import { render } from 'test/utils';

import { Base } from './CardFooterError.stories';

describe('CardFooterError', () => {
  it('Renders children', () => {
    const { expectByText } = render(<Base />);
    expectByText(
      'Something is taking longer than usual. Please refresh the page.'
    );
  });
});
