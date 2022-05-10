import { LocationDescriptor } from 'history';

import { BooleanSelection } from 'modules/wellInspect/types';

import {
  getInspectUrlSearchParams,
  getSearchParamValuesFromCurrentUrl,
} from '../inspectUrlHandler';

const selectedWellIds: BooleanSelection = {
  'test-well-1': true,
  'test-well-2': false,
};

const selectedWellboreIds: BooleanSelection = {
  'test-wellbore-1': true,
  'test-wellbore-2': false,
  'test-wellbore-3': true,
};

const inspectBaseUrl = `https://discover.test.bluefield.cogniteapp.com/search/wells/inspect/overview`;

// This should be matched with the above `selectedWellIds` and `selectedWellboreIds`.
const encodedSearchParams =
  'wells=test-well-1&wellbores=test-wellbore-1%2Ctest-wellbore-3';

const setWindowLocation = (location: LocationDescriptor) => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: location,
  });
};

describe('inspectUrlHandler', () => {
  describe('getInspectUrlSearchParams', () => {
    it('should return null when no wellbore is selected', () => {
      expect(
        getInspectUrlSearchParams({
          selectedWellIds: {},
          selectedWellboreIds: {},
        })
      ).toBeNull();
    });

    it('should return search params', () => {
      expect(
        getInspectUrlSearchParams({
          selectedWellIds,
          selectedWellboreIds,
        })
      ).toEqual(encodedSearchParams);
    });
  });

  describe('getSearchParamValuesFromCurrentUrl', () => {
    afterAll(() => setWindowLocation({}));

    it('should handle url without search params', () => {
      setWindowLocation({
        pathname: inspectBaseUrl,
      });
      expect(getSearchParamValuesFromCurrentUrl()).toEqual({
        wellIds: [],
        wellboreIds: [],
      });
    });

    it('should return url param values', () => {
      setWindowLocation({
        pathname: inspectBaseUrl,
        search: encodedSearchParams,
      });
      expect(getSearchParamValuesFromCurrentUrl()).toEqual({
        wellIds: ['test-well-1'],
        wellboreIds: ['test-wellbore-1', 'test-wellbore-3'],
      });
    });
  });
});
