import { LocationDescriptor } from 'history';

import { getSearchParamsFromCurrentUrl } from '../getSearchParamsFromCurrentUrl';

const setWindowLocation = (location: LocationDescriptor) => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: location,
  });
};

const inspectBaseUrl = `https://discover.test.bluefield.cogniteapp.com/search/wells/inspect/overview`;

describe('getSearchParamsFromCurrentUrl', () => {
  afterAll(() => setWindowLocation({}));

  it('should handle url without search params', () => {
    setWindowLocation({
      pathname: inspectBaseUrl,
    });
    expect(getSearchParamsFromCurrentUrl()).toEqual({});
  });

  it('should return search params from the current url', () => {
    setWindowLocation({
      pathname: inspectBaseUrl,
      search: 'wells=test-well-1&wellbores=test-wellbore-1%2Ctest-wellbore-3',
    });
    expect(getSearchParamsFromCurrentUrl()).toEqual({
      wells: 'test-well-1',
      wellbores: 'test-wellbore-1,test-wellbore-3',
    });
  });
});
