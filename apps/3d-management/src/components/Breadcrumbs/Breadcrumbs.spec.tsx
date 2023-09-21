import React from 'react';
import { MemoryRouter as Router } from 'react-router-dom';

import { render } from '@testing-library/react';

import Breadcrumbs from './Breadcrumbs';

describe('Breadcrumbs', () => {
  it('Renders without exploding', () => {
    const { baseElement } = render(
      <Router>
        <Breadcrumbs breadcrumbs={[]} />
      </Router>
    );
    expect(baseElement).toBeTruthy();
  });
});
