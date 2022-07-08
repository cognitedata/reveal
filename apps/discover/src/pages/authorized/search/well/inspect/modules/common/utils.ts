import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import find from 'lodash/find';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import includes from 'lodash/includes';
import map from 'lodash/map';

import { OptionType } from '@cognite/cogs.js';

import { GroupedColumn } from 'components/ManageColumnsPanel/ManageColumnsPanel';

export const getFilteredOptionTypeValues = (
  options: OptionType<WellboreInternal>[]
): WellboreInternal[] => {
  return options.reduce(
    (filtered: WellboreInternal[], option: OptionType<WellboreInternal>) => {
      const { value } = option;
      if (value) {
        return [...filtered, value];
      }
      return filtered;
    },
    []
  );
};

export const getSelectedWellboresFromOptionType = (
  optionItems: OptionType<WellboreInternal>[]
): WellboreInternal[] => {
  return optionItems.reduce(
    (acc: WellboreInternal[], item: OptionType<WellboreInternal>) => {
      const { options, value } = item;

      if (options && options.length) {
        const filterItems: WellboreInternal[] =
          getFilteredOptionTypeValues(options);
        return [...acc, ...filterItems];
      }

      if (value) return [...acc, value];

      return acc;
    },
    []
  );
};

export const groupOptionTypes = (
  wellbores: WellboreInternal[]
): OptionType<WellboreInternal>[] =>
  map(
    groupBy(wellbores, 'wellId'),
    (groupedWellbores: WellboreInternal[], key: string) => ({
      label: get(find(wellbores, { wellId: key }), 'metadata.wellDescription'),

      options: groupedWellbores.map(
        (wellbore: WellboreInternal, index: number) => ({
          label: wellbore.description || '',
          value: wellbore,
          divider: groupedWellbores.length === index + 1, // divider to last item
        })
      ),
    })
  );

export const searchByDescription = (
  allWellbores: WellboreInternal[],
  searchValue: string
) => {
  return allWellbores.filter(
    (wellbore) =>
      wellbore.description
        ?.toLowerCase()
        .includes(searchValue.toLocaleLowerCase()) ||
      wellbore.name?.toLowerCase().includes(searchValue.toLocaleLowerCase())
  );
};

export const checkIndeterminateState = (
  allWellbores: WellboreInternal[],
  selectedWellbores: WellboreInternal[],
  searchWellbores: WellboreInternal[],
  searchValue?: string
) => {
  if (searchValue) {
    // make sure to update the select all state based on search result
    // return the search wellbores which are selected
    const result = searchWellbores.filter((searchWellbore) =>
      selectedWellbores.some(
        (selectedWellbore) => searchWellbore.id === selectedWellbore.id
      )
    );
    return (
      // check all seached wellbores are selected
      searchWellbores.length > 0 && searchWellbores.length !== result.length
    );
  }

  // update select all state based on all wellbores
  return (
    selectedWellbores.length > 0 &&
    allWellbores.length !== selectedWellbores.length
  );
};

export const checkSelectAllState = (
  selectedWellbores: WellboreInternal[],
  searchWellbores: WellboreInternal[],
  searchValue?: string
) => {
  if (searchValue) {
    // make sure to update the select state based on search result
    // return the search wellbores which are selected
    const result = searchWellbores.filter((searchWellbore) =>
      selectedWellbores.some(
        (selectedWellbore) => searchWellbore.id === selectedWellbore.id
      )
    );
    return result.length > 0;
  }
  return selectedWellbores.length > 0;
};

export const mapToGroupColumns = (
  selectedWellbores: WellboreInternal[],
  searchWellbores: WellboreInternal[]
): GroupedColumn[] => {
  return map(
    groupBy(searchWellbores, 'wellId'),
    (val: WellboreInternal[], key: string) => ({
      label:
        get(find(searchWellbores, { wellId: +key }), 'metadata.wellName') || '',
      columns: val.map((wellbore: WellboreInternal) => ({
        field: wellbore.id,
        selected: includes(selectedWellbores, wellbore),
        name: `${get(wellbore, 'description', '')} ${get(
          wellbore,
          'name',
          ''
        )}`, // handle null check
        item: wellbore,
      })),
    })
  );
};
