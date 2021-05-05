import React, { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import { Button, Tooltip, message } from 'antd';
import { doSearch } from 'modules/search';
import {
  PendingResourceSelection,
  createSelection,
  WorkflowStep,
} from 'modules/workflows';
import { usePrevAndNextStep, useActiveWorkflow } from 'hooks';
import { searchCountSelector } from 'pages/SelectionPage/selectors';
import { ResourceType, Filter } from 'modules/sdk-builder/types';
import StickyBottomRow from 'components/StickyBottomRow';
import { Flex, IconButton } from 'components/Common';
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
  const [debouncedSetFilter] = useDebouncedCallback(setDelayedFilter, 300);
  const count = useSelector(searchCountSelector(type, filter));
  const { goToNextStep, goToPrevStep } = usePrevAndNextStep(step);
  useActiveWorkflow(step);
  const selectionSize = isSelectAll ? count ?? 0 : selectedRowKeys.length;

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
    if (selectionSize > 5000) {
      return {
        ...filter,
        limit: 1000,
      };
    }
    return filter;
  };

  const onNextStep = () => {
    if (!type) return;

    const selection: PendingResourceSelection = {
      type,
      endpoint: isSelectAll ? 'list' : 'retrieve',
      filter: getCurrentFilter(),
    };
    if (required && selectionSize === 0) {
      message.error('You have to select data to continue');
      return;
    }
    dispatch(createSelection(selection));
    goToNextStep();
  };

  const tooltipContent =
    required &&
    selectionSize === 0 &&
    'This step is required. You must select at least one resource before proceeding';

  useEffect(() => {
    dispatch(doSearch(type, delayedFilter));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delayedFilter]);

  return (
    <Flex column style={{ width: '100%' }}>
      {step === 'diagramSelection' && (
        <DiagramsSelection
          filter={filter}
          isSelectAll={isSelectAll}
          selectedRowKeys={selectedRowKeys}
          setSelectAll={setSelectAll}
          setSelectedRowKeys={setSelectedRowKeys}
          updateFilter={updateFilter}
        />
      )}
      {step === 'resourceSelection' && (
        <ResourcesSelection
          target="assets"
          filter={filter}
          selectedRowKeys={selectedRowKeys}
          isSelectAll={isSelectAll}
          setSelectAll={setSelectAll}
          setSelectedRowKeys={setSelectedRowKeys}
          updateFilter={updateFilter}
        />
      )}
      {step !== 'diagramSelection' && step !== 'resourceSelection' && (
        <NotFound />
      )}
      <StickyBottomRow>
        <IconButton icon="ArrowBack" type="secondary" onClick={goToPrevStep}>
          Back
        </IconButton>
        <Tooltip title={tooltipContent}>
          <Button
            type="primary"
            disabled={required && selectionSize === 0}
            onClick={onNextStep}
          >
            Next step
          </Button>
        </Tooltip>
      </StickyBottomRow>
    </Flex>
  );
}
