import {
  getExtendedResourceItem,
  getResourceItem,
} from '@data-exploration-lib/core';

import { mapExtendedProperties } from '../mapExtendedProperties';

const resourceItem = getResourceItem();
const dateRange: [Date, Date] = [
  new Date('2020,11,19'),
  new Date('2022,11,19'),
];

const prevState = getExtendedResourceItem();

const mockObject = {
  [resourceItem.id]: {
    dateRange: dateRange,
    externalId: resourceItem.externalId,
    id: resourceItem.id,
    type: resourceItem.type,
  },
};

describe('mapExtendedProperties', () => {
  it('should return undefined result', () => {
    const result = mapExtendedProperties({}, resourceItem);
    expect(result).toBeUndefined();
  });

  it('should return expected result', () => {
    const result = mapExtendedProperties(
      { [resourceItem.id]: dateRange },
      resourceItem
    );
    expect(result).toStrictEqual(mockObject);
  });

  it('should return expected result with previous state', () => {
    const result = mapExtendedProperties(
      { [resourceItem.id]: dateRange },
      resourceItem,
      prevState
    );

    expect(result).toStrictEqual({ ...prevState, ...mockObject });
  });
});
