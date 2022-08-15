import { selector } from 'recoil';
import intersection from 'lodash/intersection';
import { SearchDataFormatRoom } from 'utils/search/types';
import { getFuseSearch } from 'utils/search';

import {
  roomEquipmentFilterAtom,
  roomTypeFilterAtom,
  searchFiltersAtom,
  SEARCH_FILTER_CATEGORIES,
} from './searchFiltersAtom';
import { searchItemsAtom } from './searchItemsAtom';
import { searchQueryAtom } from './searchQueryAtom';

export const searchItemFilteredState = selector({
  key: 'searchItemFilteredState',
  get: ({ get }) => {
    const searchItems = get(searchItemsAtom);
    const searchQuery = get(searchQueryAtom);
    const searchFilter = get(searchFiltersAtom);

    const roomTypeFilter = get(roomTypeFilterAtom);
    const roomEquipmentFilter = get(roomEquipmentFilterAtom);

    let returnedItems = searchItems;
    if (searchFilter === SEARCH_FILTER_CATEGORIES.ROOMS) {
      returnedItems = searchItems.filter((item) => {
        const roomItem = item as SearchDataFormatRoom;
        const equipmentFilterLength = roomEquipmentFilter.length;

        const matchesTypesFilter =
          (roomTypeFilter && roomItem.type === roomTypeFilter.value) ||
          !roomTypeFilter;

        // check if all equipment items are in the array
        const roomEquipmentFilterTypes = roomEquipmentFilter.map(
          (equipmentItem) => equipmentItem.value
        );
        const matchesEquipmentListFilter =
          (roomEquipmentFilter &&
            intersection(roomEquipmentFilterTypes, roomItem.equipment)
              .length === equipmentFilterLength) ||
          !roomEquipmentFilter;
        return matchesTypesFilter && matchesEquipmentListFilter;
      });
    }
    if (searchFilter === SEARCH_FILTER_CATEGORIES.PEOPLE)
      returnedItems = searchItems;

    return getFuseSearch(searchQuery, returnedItems);
  },
});
