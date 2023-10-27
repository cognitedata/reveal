import { useMemo } from 'react';

import { useTranslation } from '@fdx/shared/hooks/useTranslation';
import { useFDM } from '@fdx/shared/providers/FDMProvider';
import { ValueByField } from '@fdx/shared/types/filters';

import { Button, Dropdown } from '@cognite/cogs.js';

import {
  getCustomDataTypeOption,
  transformDefFieldsToFilterFields,
} from '../../filters/filters/SearchBarFilter/utils';
import { AppliedFilters, FilterBuilderByField } from '../../filters/modules';

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
