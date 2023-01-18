import { MultiSelectFilter } from '../MultiSelectFilter';
import render from '../../../../testUtils/render';
import { screen } from '@testing-library/react';

const values: string[] = ['test value 1', 'test value 2', 'test value 3'];
const title = 'Multi select';
describe('MultiSelectFilter', () => {
  it('should render multi-select component', () => {
    render(MultiSelectFilter, undefined, {
      title,
      values,
      options: [],
    });

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(values[0])).toBeInTheDocument();
    expect(screen.getByText(values[2])).toBeInTheDocument();
  });
});
