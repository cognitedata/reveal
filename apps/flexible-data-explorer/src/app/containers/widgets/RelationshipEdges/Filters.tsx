import { useMemo } from 'react';

import { Button, Dropdown } from '@cognite/cogs.js';

import { useTranslation } from '../../../hooks/useTranslation';
import { useFDM } from '../../../providers/FDMProvider';
import { ValueByField } from '../../Filter';
import { AppliedFilters, FilterBuilderByField } from '../../Filter/containers';
import {
  getCustomDataTypeOption,
  transformDefFieldsToFilterFields,
} from '../../Filter/filters/SearchBarFilter/utils';

export interface SearchBarFilterProps {
  value?: ValueByField;
  onChange: (value: ValueByField, action: 'add' | 'remove') => void;
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
    const type = client.getTypesByDataType(dataType);

    if (type) {
      return transformDefFieldsToFilterFields(type.fields);
    }

    const customType = getCustomDataTypeOption(dataType);

    return customType?.fields || [];
  }, [client, dataType]);

  return (
    <>
      <Dropdown
        placement="bottom-end"
        content={
          <FilterBuilderByField
            name={dataType}
            fields={fields}
            value={value}
            onChange={(nextValue) => onChange(nextValue, 'add')}
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
      <AppliedFilters
        value={value}
        onRemove={(nextValue) => onChange(nextValue, 'remove')}
      />
    </>
  );
};
