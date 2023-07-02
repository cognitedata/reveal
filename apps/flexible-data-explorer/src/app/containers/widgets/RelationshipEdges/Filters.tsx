import { useMemo } from 'react';

import { Button, Dropdown } from '@cognite/cogs.js';

import { useTranslation } from '../../../hooks/useTranslation';
import { useTypesDataModelQuery } from '../../../services/dataModels/query/useTypesDataModelQuery';
import { ValueByField } from '../../search/Filter';
import {
  AppliedFilters,
  FilterBuilderByField,
} from '../../search/Filter/containers';
import { transformDefFieldsToFilterFields } from '../../search/Filter/filters/SearchBarFilter/utils';

export interface SearchBarFilterProps {
  value?: ValueByField;
  onChange: (value: ValueByField) => void;
  dataType: string;
}

export const RelationshipFilter: React.FC<SearchBarFilterProps> = ({
  dataType,
  value,
  onChange,
}) => {
  const { t } = useTranslation();
  const { data: types } = useTypesDataModelQuery();

  const fields = useMemo(() => {
    const result = types?.find((item) => item.name === dataType)?.fields || [];

    return transformDefFieldsToFilterFields(result);
  }, [types, dataType]);

  return (
    <>
      <AppliedFilters value={value} onRemove={onChange} />

      <Dropdown
        placement="bottom-end"
        content={
          <FilterBuilderByField
            name={dataType}
            fields={fields}
            value={value}
            onChange={onChange}
            onBackClick={() => null}
          />
        }
      >
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
    </>
  );
};
