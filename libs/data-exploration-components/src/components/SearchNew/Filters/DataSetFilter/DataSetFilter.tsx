import React from 'react';
import { OptionType, Tooltip } from '@cognite/cogs.js';
import { DataSet } from '@cognite/sdk';
import {
  ResourceType,
  convertResourceType,
} from '@data-exploration-components/types';
import { DataSetWCount } from '@data-exploration-components/hooks/sdk';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import { useResourceTypeDataSetAggregate } from '@data-exploration-lib/domain-layer';

import { OptionValue } from '../types';
import { useMetrics } from '@data-exploration-components/hooks/useMetrics';
import { DATA_EXPLORATION_COMPONENT } from '@data-exploration-components/constants/metrics';
import { MultiSelectFilter } from '@data-exploration-components/components';

const formatOption = (dataset: DataSetWCount): OptionType<number> => {
  const name = dataset?.name || '';
  const label = name.length > 0 ? name : `${dataset.id}`;
  return {
    label: `${label}${dataset.count ? ` (${dataset.count})` : ''}`,
    value: dataset.id,
  };
};

export const DataSetFilterV2 = ({
  resourceType,
  value,
  setValue,
}: {
  resourceType?: ResourceType;
  value?: number[];
  setValue: (newValue: OptionValue<number>[] | undefined) => void;
}) => {
  const trackUsage = useMetrics();
  const { data: currentDataSets } = useCdfItems<DataSet>(
    'datasets',
    (value || []).map((id) => ({ id })),
    false,
    {
      enabled: value && value.length > 0,
    }
  );

  const { data: datasetOptions, isError } = useResourceTypeDataSetAggregate(
    resourceType ? convertResourceType(resourceType) : undefined
  );
  const selectedValues: OptionValue<number>[] = (currentDataSets || []).map(
    (el) => ({
      label: String(el.name),
      value: el.id,
    })
  );

  return (
    <Tooltip
      interactive
      disabled={!isError}
      content={
        isError &&
        'Error fetching datasets, please make sure you have datasetsAcl:READ'
      }
    >
      <MultiSelectFilter<number>
        title="Data set"
        options={datasetOptions?.map(formatOption) || []}
        isDisabled={isError}
        onChange={(_, newValues) => {
          if (newValues) {
            setValue(newValues);
          }
          trackUsage(DATA_EXPLORATION_COMPONENT.SELECT.DATA_SET_FILTER, {
            ...newValues,
            resourceType,
          });
        }}
        value={selectedValues}
      />
    </Tooltip>
  );
};
