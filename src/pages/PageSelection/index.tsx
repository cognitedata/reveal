import React, { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import { message } from 'antd';
import { useLocalStorage } from '@cognite/cogs.js';
import { doSearch } from 'modules/search';
import {
  PendingResourceSelection,
  WorkflowStep,
  updateSelection,
  removeSelection,
  getActiveWorkflowItems,
} from 'modules/workflows';
import { ResourceType, Filter } from 'modules/types';
import {
  usePreviousSelection,
  usePreviousFilter,
  useActiveWorkflow,
  useSteps,
  useJobStarted,
} from 'hooks';
import { LS_KEY_SETTINGS } from 'stringConstants';
import NavigationStickyBottomRow from 'components/NavigationStickyBottomRow';
import { Flex } from 'components/Common';
import { searchCountSelector } from 'pages/PageSelection/selectors';
import NotFound from 'pages/NotFound';
import DiagramsSelection from './DiagramsSelection';
import ResourcesSelection from './ResourcesSelection';

const DEFAULT_FILTERS = {} as { [key in ResourceType]?: Filter };
const EMPTY_FILTER: Filter = { filter: {} };

type Props = {
  type: ResourceType;
  step: WorkflowStep;
  required?: boolean;
  defaultFilters?: { [key in ResourceType]?: Filter };
};

export default function PageSelection(props: Props): JSX.Element {
  const dispatch = useDispatch();
  const { setJobStarted } = useJobStarted();
  const { type, step, required, defaultFilters = DEFAULT_FILTERS } = props;

  useActiveWorkflow(step);
  const { goToNextStep } = useSteps(step);

  const prevFilters = usePreviousFilter();

  const [isSelectAll, setSelectAll] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<number>>([]);
  const [filter, setFilter] = useState<Filter>(
    prevFilters[step === 'diagramSelection' ? 'diagrams' : type] ??
      defaultFilters[type] ??
      EMPTY_FILTER
  );

  const [delayedFilter, setDelayedFilter] = useState<Filter>(filter);
  const [debouncedSetFilter] = useDebouncedCallback(setDelayedFilter, 200);
  const [savedSettings] = useLocalStorage(LS_KEY_SETTINGS, {
    skip: false,
  });
  const count = useSelector(searchCountSelector(type, filter));
  const { resources } = useSelector(getActiveWorkflowItems);

  const { previousSelectionLoaded } = usePreviousSelection(
    step,
    type,
    filter,
    setFilter,
    setSelectAll,
    setSelectedRowKeys
  );

  const selectionSize = isSelectAll ? count ?? 0 : selectedRowKeys.length;
  const isNoSelectionWhileRequired = required && selectionSize === 0;
  const isNoSelectionOfAtLeastOneOptional =
    !required &&
    step === 'resourceSelectionAssets' &&
    !Object.keys(resources ?? [])?.length;

  const isStepDiagramSelection = step === 'diagramSelection';
  const isStepResourceSelection = step.startsWith('resourceSelection');

  const isStepSkippable =
    (step === 'resourceSelectionFiles' &&
      !resources?.some((resource) => resource.type === 'files')) ||
    (step === 'resourceSelectionAssets' &&
      (resources ?? [])?.length > 0 &&
      !resources?.some((resource) => resource.type === 'assets'));

  const updateFilter = useCallback(
    (f: Filter) => {
      setFilter(f);
      debouncedSetFilter(f); // [todo] problem: this NEVER gets triggered if filter is only mime type
    },
    [debouncedSetFilter]
  );
  const getCurrentFilter = () => {
    if (!isSelectAll) {
      return selectedRowKeys.map((el) => ({ id: el }));
    }
    return {
      ...filter,
      limit: 1000,
    };
  };

  const updateCurrentSelection = () => {
    if (previousSelectionLoaded) {
      if (selectionSize === 0) {
        dispatch(removeSelection(type));
      }
      if (selectionSize > 0) {
        const currentFilter = getCurrentFilter();
        const selection: PendingResourceSelection = {
          type,
          filter: currentFilter,
          endpoint: isSelectAll ? 'list' : 'retrieve',
        };
        dispatch(updateSelection(selection));
        setJobStarted(false);
      }
    }
  };

  const onNextStep = (): void => {
    if (required && selectionSize === 0) {
      message.error('You have to select data to continue');
      return;
    }
    if (!type) return;
    const skipStep = savedSettings.skip === true;
    goToNextStep(skipStep);
  };

  useEffect(() => {
    updateCurrentSelection();
    // eslint-disable-next-line
  }, [selectionSize]);

  useEffect(() => {
    dispatch(doSearch(type, delayedFilter));
    // eslint-disable-next-line
  }, [delayedFilter]);

  const tooltipContent = (): string | undefined => {
    if (isNoSelectionWhileRequired)
      return 'This step is required. You must select at least one resource before proceeding';
    if (isNoSelectionOfAtLeastOneOptional)
      return 'You must select at least one optional resource before proceeding';
    return undefined;
  };

  const getSelectionPage = () => {
    if (isStepDiagramSelection)
      return (
        <DiagramsSelection
          filter={filter}
          isSelectAll={isSelectAll}
          selectedRowKeys={selectedRowKeys}
          setSelectAll={setSelectAll}
          setSelectedRowKeys={setSelectedRowKeys}
          updateFilter={updateFilter}
        />
      );
    if (isStepResourceSelection) {
      const target = (): ResourceType => {
        if (step === 'resourceSelectionAssets') return 'assets';
        if (step === 'resourceSelectionFiles') return 'files';
        return 'assets';
      };
      return (
        <ResourcesSelection
          filter={filter}
          isSelectAll={isSelectAll}
          selectedRowKeys={selectedRowKeys}
          setSelectAll={setSelectAll}
          setSelectedRowKeys={setSelectedRowKeys}
          updateFilter={updateFilter}
          target={target()}
        />
      );
    }
    return <NotFound />;
  };

  return (
    <Flex column style={{ width: '100%' }}>
      {getSelectionPage()}
      <NavigationStickyBottomRow
        step={step}
        next={{
          tooltip: tooltipContent(),
          disabled:
            isNoSelectionWhileRequired || isNoSelectionOfAtLeastOneOptional,
          onClick: onNextStep,
        }}
        skip={{
          onClick: onNextStep,
        }}
        showSkipButton={isStepSkippable}
      />
    </Flex>
  );
}
