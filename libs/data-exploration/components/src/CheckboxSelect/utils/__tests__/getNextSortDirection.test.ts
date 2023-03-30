import { SortDirection } from '../../types';
import { getNextSortDirection } from '../getNextSortDirection';

describe('NestedFilter/getNextSortDirection', () => {
  it('should return next sort direction correctly', () => {
    expect(getNextSortDirection()).toEqual(SortDirection.Ascending);

    expect(getNextSortDirection(SortDirection.Ascending)).toEqual(
      SortDirection.Descending
    );

    expect(getNextSortDirection(SortDirection.Descending)).toEqual(
      SortDirection.Ascending
    );
  });
});
