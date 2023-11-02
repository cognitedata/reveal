import React from 'react';

import { useTranslation } from '@fdx/shared/hooks/useTranslation';
import { ValueByField } from '@fdx/shared/types/filters';

import { Button, Dropdown } from '@cognite/cogs.js';
import { Timeseries } from '@cognite/sdk';

import { Filter } from '../../filters';
import { AppliedFilters } from '../../filters/modules';

export type RelationshipFilterAction = 'add' | 'remove';

export interface RelationshipFilterProps<T> {
  value?: ValueByField<T>;
  onChange: (value: ValueByField, action: RelationshipFilterAction) => void;
}

export const RelationshipFilter = <T,>({
  value,
  onChange,
  children,
}: React.PropsWithChildren<RelationshipFilterProps<T>>) => {
  const { t } = useTranslation();

  return (
    <>
      <Dropdown placement="bottom-end" content={children}>
        <Button
          icon="Filter"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {t('FILTER_BUTTON')}
        </Button>
      </Dropdown>

      <AppliedFilters
        value={value}
        onRemove={(nextValue) => onChange(nextValue, 'remove')}
      />
    </>
  );
};

const TimeseriesRelationshipFilter: React.FC<
  RelationshipFilterProps<Timeseries>
> = (props) => {
  const { value, onChange } = props;

  return (
    <RelationshipFilter {...props}>
      <Filter.Timeseries
        value={value}
        onChange={(nextValue) => onChange(nextValue, 'add')}
      />
    </RelationshipFilter>
  );
};

RelationshipFilter.Timeseries = TimeseriesRelationshipFilter;
