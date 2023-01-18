import { FilterTitle } from '../FilterTitle';
import render from '../../../../testUtils/render';
import { screen } from '@testing-library/react';

describe('FilterTitle', () => {
  it('should render filter title', () => {
    render(FilterTitle, undefined, { children: <>Filter Title</> });
    expect(screen.getByText('Filter Title')).toBeInTheDocument();
  });
});
