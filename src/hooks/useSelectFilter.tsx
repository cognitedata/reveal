import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { OptionType } from '@cognite/cogs.js';
import isEqual from 'lodash/isEqual';
import { RootState } from 'store';
import { ResourceType, Filter } from 'modules/types';

/**
 * Ensures that the filtered resources are loaded before the app attempts to select them.
 * This is useful when user refreshed the page or left it and opened it again.
 */
export function useSelectFilter<T extends string | number>(
  filterLoaded: boolean,
  options: OptionType<React.ReactText>[] | undefined,
  selection: T[] | undefined,
  onSelection: (options: T[]) => void,
  setQuery?: (query: string) => void
) {
  const [currentSelection, setCurrentSelection] = useState<
    OptionType<React.ReactText>[]
  >([]);

  const displayFilterLabels = () => {
    const fixedSelection = selection!.map((id: T) => ({
      label: String(
        options!.find(
          (option: OptionType<React.ReactText>) => option.value === id
        )?.label ?? id
      ),
      value: id,
    }));
    const shouldSelectionUpdate = !isEqual(fixedSelection, currentSelection);
    if (shouldSelectionUpdate) setMultiSelection(fixedSelection);
  };

  /* ----------- */

  const setSingleSelection = (item: OptionType<React.ReactText>) => {
    if (!filterLoaded) return;
    if (!item) deselect();
    select([item]);
    if (setQuery) setQuery('');
  };
  const setMultiSelection = (items?: OptionType<React.ReactText>[]) => {
    if (!filterLoaded) return;
    if (!items?.length) deselect();
    else select(items);
    if (setQuery) setQuery('');
  };

  /* ----------- */

  const select = (items: OptionType<React.ReactText>[]) => {
    setCurrentSelection(items);
    onSelection(items.map((i: OptionType<React.ReactText>) => i?.value as T));
  };
  const deselect = () => {
    setCurrentSelection([]);
    onSelection([]);
  };

  useEffect(() => {
    if (selection && filterLoaded && options) displayFilterLabels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection, filterLoaded, options]);

  return {
    currentSelection,
    setSingleSelection,
    setMultiSelection,
  };
}

/**
 * Gets the fetching status of the selection.
 * Selection always loads max. 1 page to display in front end,
 * therefore we need to insert {all: false} to the filter
 * and then we are sure that our status will be under the "1/1" key
 */
export const useSelectionFetchStatus = (
  resourceType: ResourceType,
  filter: Filter
) => {
  const status = useSelector((state: RootState) => {
    const fixedFilter = JSON.stringify({
      ...filter,
      all: false,
    });
    const selectionFetchingStatus =
      state[resourceType]?.list[fixedFilter]?.['1/1'];
    return selectionFetchingStatus?.status ?? 'UNKNOWN';
  });

  return {
    status,
    isLoaded: status === 'success',
  };
};
