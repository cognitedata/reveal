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
 * it also takes diagramToContextualizeId if we want to contextualize
 * one specific diagram (usually chosen on landing page)
 */
export const useItemsAndFetching = (
  type: ResourceType,
  filter: Filter,
  diagramToContextualizeId?: number
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
    diagramToContextualizeId
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
    if (diagramToContextualizeId) getAndUpdateDiagrams();
    else getAndUpdateOtherItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    diagramToContextualizeId,
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
 * @param diagramToContextualizeId? : number;
 * @returns
 */
export const useIncludeSelectedDiagramInDiagramList = (
  type: ResourceType,
  filter: Filter,
  diagramToContextualizeId?: number
) => {
  const [fixedDiagrams, setFixedDiagrams] = useState<FileInfo[]>([]);
  const { items, fetching } = useSelector(searchItemSelector)(type, filter);
  const prevDiagrams = usePrevious(fixedDiagrams);
  const diagramToContextualizeFromStore = useSelector(
    (state: RootState) =>
      diagramToContextualizeId &&
      state.files?.items?.list?.[diagramToContextualizeId]
  );

  const allRelevantDiagrams = (): FileInfo[] => {
    const mappedItems = items?.map((item: FileInfo) => ({ ...item })) ?? [];
    if (diagramToContextualizeId) {
      const diagramToContextualizeFromList = mappedItems.find(
        (item: FileInfo) => item.id === diagramToContextualizeId
      );
      const allOtherDiagrams = mappedItems.filter(
        (item: FileInfo) => item.id !== diagramToContextualizeId
      );
      if (diagramToContextualizeFromList)
        return [diagramToContextualizeFromList, ...allOtherDiagrams];
      if (diagramToContextualizeFromStore)
        return [diagramToContextualizeFromStore, ...allOtherDiagrams];
      return [...allOtherDiagrams];
    }
    return mappedItems;
  };

  useEffect(() => {
    const relevantDiagrams = allRelevantDiagrams();
    if (shouldUpdate(prevDiagrams, relevantDiagrams))
      setFixedDiagrams(relevantDiagrams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, fetching, diagramToContextualizeFromStore]);

  return { items: fixedDiagrams, fetching };
};
