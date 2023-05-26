import { screen } from '@testing-library/react';

import render from '../../../../testUtils/render';
import { FilterTitle } from '../FilterTitle';

describe('FilterTitle', () => {
  it('should render filter title', () => {
    render(FilterTitle, undefined, { children: <>Filter Title</> });
    expect(screen.getByText('Filter Title')).toBeInTheDocument();
  });
});
