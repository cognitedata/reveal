import { useTranslation } from '@transformations/common';
import { useDataSet } from '@transformations/hooks';
import {
  FiltersAction,
  FiltersState,
} from '@transformations/pages/transformation-list/TransformationList';

import { Flex, Chip } from '@cognite/cogs.js';

import { parseDataModelKey } from '../../utils/fdm';

type AppliedFiltersProps = {
  filterState: FiltersState['applied'];
  onFilterChange: (action: FiltersAction) => void;
};

const joinFilters = (filters?: string[]) => filters?.join(', ').trim();

export const AppliedFilters = ({
  filterState,
  onFilterChange,
}: AppliedFiltersProps) => {
  const { t } = useTranslation();
  const { lastRun, schedule, dataSet: dataSetId } = filterState;
  const { data: dataSet } = useDataSet(Number(dataSetId), {
    enabled: !!dataSetId,
  });

  const { externalId, space } = parseDataModelKey(filterState.dataModel);

  return (
    <Flex gap={8}>
      {lastRun.length > 0 && (
        <Chip
          size="small"
          type="neutral"
          label={`${t('last-run-colon')} ${joinFilters(lastRun)}`}
          onRemove={() => {
            onFilterChange({ type: 'remove', field: 'lastRun' });
            onFilterChange({ type: 'submit' });
          }}
        />
      )}
      {schedule.length > 0 && (
        <Chip
          size="small"
          label={`${t('schedule-colon')} ${joinFilters(schedule)}`}
          onRemove={() => {
            onFilterChange({ type: 'remove', field: 'schedule' });
            onFilterChange({ type: 'submit' });
          }}
          type="neutral"
        />
      )}
      {dataSet && (
        <Chip
          size="small"
          type="neutral"
          label={`${t('data-set-colon')} ${
            dataSet?.name ?? dataSet?.externalId ?? dataSet?.id
          }`}
          onRemove={() => {
            onFilterChange({ type: 'change', field: 'dataSet', payload: '' });
            onFilterChange({ type: 'submit' });
          }}
        />
      )}
      {(lastRun.length > 0 || schedule.length > 0 || dataSet) && (
        <Chip
          size="small"
          type="neutral"
          label={t('clear-all')}
          onClick={() => onFilterChange({ type: 'reset' })}
        />
      )}
      {externalId && space && (
        <Chip
          size="small"
          type="neutral"
          label={`${externalId} (${space})`}
          onRemove={() => {
            onFilterChange({
              type: 'change',
              field: 'dataModel',
              payload: '',
            });
            onFilterChange({ type: 'submit' });
          }}
        />
      )}
    </Flex>
  );
};
