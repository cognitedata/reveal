import { useMemo } from 'react';

import { Button, Dropdown } from '@cognite/cogs.js';

import { useTranslation } from '../../../hooks/useTranslation';
import { useFDM } from '../../../providers/FDMProvider';
import { ValueByField } from '../../Filter';
import { AppliedFilters, FilterBuilderByField } from '../../Filter/containers';
import { transformDefFieldsToFilterFields } from '../../Filter/filters/SearchBarFilter/utils';

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
  const client = useFDM();

  const fields = useMemo(() => {
    const result =
      client.allDataTypes?.find((item) => item.name === dataType)?.fields || [];

    return transformDefFieldsToFilterFields(result);
  }, [client.allDataTypes, dataType]);

  return (
    <>
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
      <AppliedFilters value={value} onRemove={onChange} />
    </>
  );
};
