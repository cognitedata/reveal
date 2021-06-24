import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import isEqual from 'lodash/isEqual';
import { usePrevious } from 'hooks';
import { FileInfo } from '@cognite/sdk';
import { searchItemSelector } from 'pages/SelectionPage/selectors';
import { RootState } from 'store';
import { ResourceType, Filter } from 'modules/types';

export type Item = { id: number; name: string };

const shouldUpdate = (itemsToGetUpdated: Item[], newItems: Item[]) =>
  !!itemsToGetUpdated && !isEqual(itemsToGetUpdated, newItems);

/**
 * This hook decides what items need to be fetched. In case of diagrams,
 * it also takes diagramsToContextualizeIds if we want to contextualize
 * one or more specific diagrams (usually chosen on landing page,
 * or going back to previous selection)
 */
export const useItemsAndFetching = (
  type: ResourceType,
  filter: Filter,
  diagramsToContextualizeIds?: number[]
) => {
  const [fixedItems, setFixedItems] = useState<Item[]>([]);
  const [fixedFetching, setFixedFetching] = useState(false);
  const prevItems = usePrevious(fixedItems);

  const {
    items: diagramsWithInsertedFile,
    fetching: fetchingDiagramsWithInsertedFile,
  } = useIncludeSelectedDiagramInDiagramList(
    type,
    filter,
    diagramsToContextualizeIds
  );
  const { items: defaultItems, fetching: fetchingDefaultItems } = useSelector(
    searchItemSelector
  )(type, filter);

  const getAndUpdateDiagrams = () => {
    const shouldDiagramsUpdate = shouldUpdate(
      prevItems,
      diagramsWithInsertedFile
    );
    if (!shouldDiagramsUpdate) return;
    setFixedItems(diagramsWithInsertedFile);
    setFixedFetching(fetchingDiagramsWithInsertedFile);
  };

  const getAndUpdateOtherItems = () => {
    const shouldItemsUpdate = shouldUpdate(prevItems, defaultItems);
    if (!shouldItemsUpdate) return;
    setFixedItems(defaultItems);
    setFixedFetching(fetchingDefaultItems);
  };

  useEffect(() => {
    if (diagramsToContextualizeIds) getAndUpdateDiagrams();
    else getAndUpdateOtherItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    diagramsToContextualizeIds,
    prevItems,
    diagramsWithInsertedFile,
    fetchingDiagramsWithInsertedFile,
    defaultItems,
    fetchingDefaultItems,
  ]);

  return { items: fixedItems, fetching: fixedFetching };
};

/**
 * User can choose a file to be contextualized on the landing page.
 * Sometimes this diagram is not amongst the first 100 fetched
 * with the /files/list request on the selection page.
 * Then we need to fetch that file separately, and append it to
 * the beginning of the list.
 * In case the diagram is present amongst the first 100 results,
 * we don't refetch it, but we still move it to front.
 * @param type : ResourceType;
 * @param filter : Filter;
 * @param diagramsToContextualizeIds? : number;
 * @returns
 */
export const useIncludeSelectedDiagramInDiagramList = (
  type: ResourceType,
  filter: Filter,
  diagramsToContextualizeIds?: number[]
) => {
  const [fixedDiagrams, setFixedDiagrams] = useState<FileInfo[]>([]);
  const { items, fetching } = useSelector(searchItemSelector)(type, filter);
  const prevDiagrams = usePrevious(fixedDiagrams);
  const diagramsToContextualizeFromStore = useSelector(
    (state: RootState) =>
      diagramsToContextualizeIds &&
      Object.values(state.files?.items?.list).filter((diagram) =>
        diagramsToContextualizeIds.includes(diagram?.id)
      )
  );

  const allRelevantDiagrams = (): FileInfo[] => {
    const mappedItems = items?.map((item: FileInfo) => ({ ...item })) ?? [];
    if (diagramsToContextualizeIds) {
      const diagramsToContextualizeFromList = mappedItems.filter(
        (item: FileInfo) => diagramsToContextualizeIds.includes(item.id)
      );
      const allOtherDiagrams = mappedItems.filter(
        (item: FileInfo) => !diagramsToContextualizeIds.includes(item.id)
      );
      if (diagramsToContextualizeFromList?.length)
        return [...diagramsToContextualizeFromList, ...allOtherDiagrams];
      if (diagramsToContextualizeFromStore?.length)
        return [...diagramsToContextualizeFromStore, ...allOtherDiagrams];
      return [...allOtherDiagrams];
    }
    return mappedItems;
  };

  useEffect(() => {
    const relevantDiagrams = allRelevantDiagrams();
    if (shouldUpdate(prevDiagrams, relevantDiagrams))
      setFixedDiagrams(relevantDiagrams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, fetching, diagramsToContextualizeFromStore]);

  return { items: fixedDiagrams, fetching };
};

export const useSelectedItems = (
  items: Item[],
  filter: Filter,
  isSelectAll: boolean,
  selectedRowKeys: number[]
) => {
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);

  useEffect(() => {
    if (isSelectAll) {
      setSelectedItems(items);
    } else if (selectedRowKeys) {
      setSelectedItems(
        items.filter((item) => selectedRowKeys.includes(item.id))
      );
    }
  }, [filter, isSelectAll, items, selectedRowKeys]);

  return selectedItems;
};
