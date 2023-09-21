import React from 'react';

import { OptionType, Tooltip } from '@cognite/cogs.js';

import {
  DATA_EXPLORATION_COMPONENT,
  useMetrics,
  useTranslation,
} from '@data-exploration-lib/core';
import { useDatasetsListQuery } from '@data-exploration-lib/domain-layer';

import { DataSetWCount } from '../../../../hooks';
import { ResourceType } from '../../../../types';
import { MultiSelectFilter } from '../../../MultiSelectFilter';
import { OptionValue } from '../types';

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
  value?: OptionValue<number>[];
  setValue: (newValue: OptionValue<number>[] | undefined) => void;
}) => {
  const { t } = useTranslation();
  const trackUsage = useMetrics();

  const { data: datasetOptions = [], isError } = useDatasetsListQuery({
    filterArchivedItems: true,
  });

  const options = React.useMemo(() => {
    return datasetOptions.map(formatOption);
  }, [datasetOptions]);

  return (
    <Tooltip
      interactive
      disabled={!isError}
      content={
        isError &&
        t(
          'PERMISSIONS_ERROR_FETCHING',
          'Error fetching datasets, please make sure you have datasetsAcl:READ',
          {
            dataType: 'datasets',
            permissionType: 'datasetsAcl:READ',
          }
        )
      }
    >
      <MultiSelectFilter<number>
        title="Data set"
        options={options || []}
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
        value={value || []}
      />
    </Tooltip>
  );
};
