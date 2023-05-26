import { getResourceTypeById } from '..';

describe('getResourceTypeById', () => {
  it('Should return the correct resource from the id', () => {
    expect(getResourceTypeById('event-search-results')).toBe('event');
    expect(getResourceTypeById('search-results')).toBe('asset');
  });
});
