import {
  WellGroupsResponse,
  WellGroupsResponseBlocks,
} from '@cognite/discover-api-types';

import { WellFilterMapValue } from '../types';

/*
 * This checks and updates selected child values when removing parent elements
 */

export const isChildShouldUpdateWith = (
  selectedChildValues: WellFilterMapValue,
  selectedValues: WellFilterMapValue,
  currentAccessor: keyof WellGroupsResponseBlocks,
  childAccessor: keyof WellGroupsResponse,
  wellGroups?: WellGroupsResponse
) => {
  if (
    !selectedChildValues ||
    !Array.isArray(selectedChildValues) ||
    !wellGroups
  )
    return {};

  const childFilters = (selectedChildValues as string[]).map(
    (field: string) =>
      (
        wellGroups[childAccessor][
          field
        ] as WellGroupsResponse[keyof WellGroupsResponse]
      )[currentAccessor]
  );

  const uniqueChildSet = [...new Set(childFilters)];

  if (
    selectedValues &&
    selectedValues.toString().indexOf(uniqueChildSet.toString()) > -1 // checks, uniqueChildSet is a subset of selected values
  )
    return { isUpdate: false, value: undefined };

  if (!selectedValues) return { isUpdate: true, value: [] };

  return {
    isUpdate: true,
    value: selectedChildValues.filter((selectedValue) =>
      selectedValues.includes(
        String(
          (
            wellGroups[childAccessor][
              selectedValue
            ] as WellGroupsResponse[keyof WellGroupsResponse]
          )[currentAccessor]
        ) || ''
      )
    ),
  };
};
