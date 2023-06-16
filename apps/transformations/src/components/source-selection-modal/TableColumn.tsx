import { useMemo } from 'react';

import { useTranslation } from '@transformations/common';
import { useTables } from '@transformations/hooks';
import { collectPages } from '@transformations/utils';

import { Flex, Icon } from '@cognite/cogs.js';

import {
  Column,
  Item,
  CenteredColumnContent,
  Label,
} from './styled-components';
import { Props2 } from './types';

type Props = Props2 & { database: string };
export default function TableColumn({ database, mapping, update }: Props) {
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
          onClick={() => update({ ...mapping, sourceLevel2: table.name })}
          $active={table.name === mapping.sourceLevel2}
        >
          <Flex alignItems="center" gap={8}>
            <Icon type="DataTable" />
            {table.name}
          </Flex>
          {table.name === mapping.sourceLevel2 && <Icon type="Checkmark" />}
        </Item>
      ))}
    </Column>
  );
}
