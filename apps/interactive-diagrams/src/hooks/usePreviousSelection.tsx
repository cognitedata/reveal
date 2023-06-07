import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getActiveWorkflowItems } from 'modules/workflows';
import {
  ResourceSelection,
  WorkflowStep,
  ResourceType,
  Filter,
} from 'modules/types';
import { useItemsAndFetching } from 'hooks';

type AwaitingResourcesToLoad = 'idle' | 'awaiting' | 'done';

export const usePreviousSelection = (
  step: WorkflowStep,
  resourceType: ResourceType,
  defaultFilter: Filter,
  setFilter: (filter: Filter) => void,
  setSelectAll: (selectAll: boolean) => void,
  setSelectedRowKeys: (selectedRowKeys: Array<number>) => void
) => {
  const [loadItemsStatus, setLoadItemsStatus] =
    useState<AwaitingResourcesToLoad>('idle');
  const [previousSelectionLoaded, setPreviousSelectionLoaded] = useState(false);
  const [itemFilter, setItemFilter] = useState<Filter>(defaultFilter);
  const { items } = useItemsAndFetching(resourceType, itemFilter);
  const { diagrams, resources } = useSelector(getActiveWorkflowItems);

  const isStepDiagramSelection = step === 'diagramSelection';
  const isStepResourceSelection = step.startsWith('resourceSelection');
  const resource = resources?.find(
    (r: ResourceSelection) => r.type === resourceType
  );

  const getItemsSelection = (): ResourceSelection | undefined => {
    if (isStepDiagramSelection) return diagrams;
    if (isStepResourceSelection) return resource;
    return undefined;
  };

  const isEndpointList = (): boolean => {
    if (isStepDiagramSelection) return diagrams?.endpoint === 'list';
    if (isStepResourceSelection) return resource?.endpoint === 'list';
    return false;
  };
  const isEndpointRetrieve = (): boolean => {
    if (isStepDiagramSelection) return diagrams?.endpoint === 'retrieve';
    if (isStepResourceSelection) return resource?.endpoint === 'retrieve';
    return false;
  };

  useEffect(() => {
    if (previousSelectionLoaded) return;
    startLoadingPreviousSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startLoadingPreviousSelection = () => {
    if (isEndpointList()) {
      if (isStepDiagramSelection) {
        setItemFilter(diagrams?.filter ?? defaultFilter);
        setFilter(diagrams?.filter ?? defaultFilter);
      }
      if (isStepResourceSelection) {
        setItemFilter(resource?.filter ?? defaultFilter);
        setFilter(resource?.filter ?? defaultFilter);
      }
    }
    if (isEndpointRetrieve()) {
      setItemFilter(defaultFilter);
      setFilter(defaultFilter);
    }
  };

  useEffect(() => {
    const itemsDownloaded = Boolean(items?.length);
    if (!itemsDownloaded && loadItemsStatus !== 'awaiting')
      setLoadItemsStatus('awaiting');
    if (itemsDownloaded && loadItemsStatus !== 'done')
      setLoadItemsStatus('done');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(() => {
    const itemsDownloaded = Boolean(items?.length);
    if (loadItemsStatus === 'awaiting' && itemsDownloaded) loadSelection();
    if (loadItemsStatus === 'done') setPreviousSelectionLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadItemsStatus, items]);

  const loadSelection = () => {
    if (isEndpointRetrieve()) {
      const ids = getItemsSelection()?.filter.map((f: any) => f.id);
      setSelectedRowKeys(ids);
    }
    if (isEndpointList()) setSelectAll(true);
    setLoadItemsStatus('done');
  };

  return { previousSelectionLoaded, itemFilter };
};
