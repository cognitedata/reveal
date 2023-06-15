import { useMemo } from 'react';

import { useTranslation } from '@transformations/common';
import {
  CenteredColumnContent,
  Column,
  Item,
  Label,
} from '@transformations/components/source-selection-modal/styled-components';
import { useTables } from '@transformations/hooks';
import { collectPages } from '@transformations/utils';

import { Flex, Icon } from '@cognite/cogs.js';

type TableColumnProps = {
  database: string;
  onChange: (value: string) => void;
  value?: string;
};

const TableColumn = ({
  database,
  onChange,
  value,
}: TableColumnProps): JSX.Element => {
  const { t } = useTranslation();

  const { data, isSuccess, isInitialLoading } = useTables({ database });
  const tables = useMemo(
    () => collectPages(data).sort((a, b) => a.name.localeCompare(b.name)),
    [data]
  );

  return (
    <Column>
      <Label>{t('table', { count: tables?.length || 0 })}</Label>
      {isInitialLoading && (
        <CenteredColumnContent>
          <Icon type="Loader" />
        </CenteredColumnContent>
      )}
      {isSuccess && tables?.length === 0 && (
        <CenteredColumnContent>{t('no-tables-found')}</CenteredColumnContent>
      )}
      {tables?.map((table) => (
        <Item
          key={table.name}
          $active={table.name === value}
          onClick={() => onChange(table.name)}
        >
          <Flex alignItems="center" gap={8}>
            <Icon type="DataTable" />
            {table.name}
          </Flex>
          {table.name === value && <Icon type="Checkmark" />}
        </Item>
      ))}
    </Column>
  );
};

export default TableColumn;
