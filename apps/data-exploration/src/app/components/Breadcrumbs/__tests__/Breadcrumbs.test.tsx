import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { Breadcrumbs } from '../Breadcrumbs';
import render from '../../../../testUtils/render';

describe('Breadcrumbs', () => {
  it('Should render breadcrumbs correctly', () => {
    render(Breadcrumbs, undefined, {
      currentResource: { title: 'Test title' },
    });

    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Test title')).toBeInTheDocument();
  });
});
