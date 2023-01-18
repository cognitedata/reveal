import '@testing-library/jest-dom';
import { Breadcrumbs } from '../Breadcrumbs';
import render from '../../../../testUtils/render';
import { screen } from '@testing-library/react';

describe('Breadcrumbs', () => {
  it('Should render breadcrumbs correctly', () => {
    render(Breadcrumbs, undefined, {
      currentResource: { title: 'Test title' },
    });

    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Test title')).toBeInTheDocument();
  });
});
