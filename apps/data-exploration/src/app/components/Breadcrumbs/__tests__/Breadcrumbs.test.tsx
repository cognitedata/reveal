import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';

import render from '../../../../testUtils/render';
import { Breadcrumbs } from '../Breadcrumbs';

describe('Breadcrumbs', () => {
  it('Should render breadcrumbs correctly', () => {
    render(Breadcrumbs, undefined, {
      currentResource: { title: 'Test title' },
    });

    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Test title')).toBeInTheDocument();
  });
});
