import { useMemo } from 'react';

import { useTranslation } from '@transformations/common';
import { useDatabases } from '@transformations/hooks';
import { collectPages } from '@transformations/utils';

import { Flex, Icon } from '@cognite/cogs.js';

import {
  Column,
  Item,
  CenteredColumnContent,
  Label,
} from './styled-components';
import { Props2 } from './types';

export default function DatabaseColumn({ mapping, update }: Props2) {
  const { t } = useTranslation();
  const { data, isSuccess, isInitialLoading } = useDatabases();
  const databases = useMemo(
    () => collectPages(data).sort((a, b) => a.name.localeCompare(b.name)),
    [data]
  );

  return (
    <Column $border>
      <Label>{t('database', { count: databases?.length || 0 })}</Label>
      {isInitialLoading && (
        <CenteredColumnContent>
          <Icon type="Loader" />
        </CenteredColumnContent>
      )}
      {isSuccess && databases?.length === 0 && (
        <CenteredColumnContent>{t('no-database-found')}</CenteredColumnContent>
      )}
      {databases?.map((db) => (
        <Item
          key={db.name}
          $active={db.name === mapping.sourceLevel1}
          onClick={() =>
            update({
              ...mapping,
              sourceLevel1: db.name,
              sourceLevel2: undefined,
            })
          }
        >
          <Flex alignItems="center" gap={8}>
            <Icon type="DataSource" />
            {db.name}
          </Flex>
          <Icon type="ChevronRight" />
        </Item>
      ))}
    </Column>
  );
}
