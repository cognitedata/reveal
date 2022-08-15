import { OptionType } from '@cognite/cogs.js';
import { atom } from 'recoil';

export enum SEARCH_FILTER_CATEGORIES {
  ROOMS = 'rooms',
  PEOPLE = 'people',
}

export const searchSectionNameMap: Record<string, string> = {
  rooms: 'Rooms',
  people: 'People',
};

export const searchFiltersAtom = atom<SEARCH_FILTER_CATEGORIES | undefined>({
  key: 'SearchFilters',
  default: undefined,
});

export const roomTypeFilterAtom = atom<OptionType<string> | undefined>({
  key: 'RoomTypeFilter',
  default: undefined,
});

export const roomEquipmentFilterAtom = atom<OptionType<string>[]>({
  key: 'RoomEquipmentFilter',
  default: [],
});
