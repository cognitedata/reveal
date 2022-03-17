import React from 'react';

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Extractors from './Extractors';

describe('Extractors', () => {
  it('Renders without exploding', () => {
    const { getAllByText } = render(
      <MemoryRouter>
        <Extractors />
      </MemoryRouter>
    );
    expect(getAllByText('Extractors').length).toBeGreaterThanOrEqual(1);
  });
});
