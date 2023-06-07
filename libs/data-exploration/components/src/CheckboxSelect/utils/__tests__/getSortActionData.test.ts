import { SortDirection } from '../../types';
import { ASCENDING, DESCENDING, getSortActionData } from '../getSortActionData';

describe('NestedFilter/getSortActionData', () => {
  it('should return ascending', () => {
    expect(getSortActionData()).toEqual(ASCENDING);
    expect(getSortActionData(SortDirection.Ascending)).toEqual(ASCENDING);
  });

  it('should return descending', () => {
    expect(getSortActionData(SortDirection.Descending)).toEqual(DESCENDING);
  });
});
