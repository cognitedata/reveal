import React, { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import { Button, Tooltip, message } from 'antd';
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
  usePrevAndNextStep,
  useActiveWorkflow,
  usePreviousSelection,
} from 'hooks';
import { LS_SAVED_SETTINGS } from 'stringConstants';
import StickyBottomRow from 'components/StickyBottomRow';
import { Flex, IconButton } from 'components/Common';
import { searchCountSelector } from 'pages/SelectionPage/selectors';
import NotFound from 'pages/NotFound';
import DiagramsSelection from './DiagramsSelection';
import ResourcesSelection from './ResourcesSelection';

const DEFAULT_FILTERS = {} as { [key in ResourceType]?: Filter };
const EMPTY_FILTER: Filter = {
  filter: {},
  search: undefined,
};

type Props = {
  type: ResourceType;
  step: WorkflowStep;
  required?: boolean;
  defaultFilters?: { [key in ResourceType]?: Filter };
};

export default function SelectionPage(props: Props): JSX.Element {
  const dispatch = useDispatch();
  const { type, step, required, defaultFilters = DEFAULT_FILTERS } = props;
  const [isSelectAll, setSelectAll] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<number>>([]);
  const [filter, setFilter] = useState<Filter>(
    defaultFilters[type] ?? EMPTY_FILTER
  );
  const [delayedFilter, setDelayedFilter] = useState<Filter>(filter);
  const [savedSettings] = useLocalStorage(LS_SAVED_SETTINGS, {
    skip: false,
  });
  const [debouncedSetFilter] = useDebouncedCallback(setDelayedFilter, 200);
  const count = useSelector(searchCountSelector(type, filter));
  useActiveWorkflow(step);
  const { goToNextStep, goToPrevStep } = usePrevAndNextStep(step);
  const { resources } = useSelector(getActiveWorkflowItems);

  const previousSelectionLoaded = usePreviousSelection(
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
    step === 'resourceSelectionFiles' &&
    !Object.keys(resources ?? [])?.length;

  const isStepDiagramSelection = step === 'diagramSelection';
  const isStepResourceSelection = step.startsWith('resourceSelection');

  const updateFilter = useCallback(
    (f: Filter) => {
      setFilter(f);
      debouncedSetFilter(f);
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
      <StickyBottomRow>
        <IconButton icon="ArrowBack" type="secondary" onClick={goToPrevStep}>
          Back
        </IconButton>
        <Tooltip title={tooltipContent()}>
          <Button
            type="primary"
            disabled={
              isNoSelectionWhileRequired || isNoSelectionOfAtLeastOneOptional
            }
            onClick={onNextStep}
          >
            Next step
          </Button>
        </Tooltip>
      </StickyBottomRow>
    </Flex>
  );
}
