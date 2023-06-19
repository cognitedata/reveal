import { useMemo } from 'react';

import { useTranslation } from '@transformations/common';
import {
  CenteredColumnContent,
  Column,
  Item,
  Label,
} from '@transformations/components/source-selection-modal/styled-components';
import { useDatabases } from '@transformations/hooks';
import { collectPages } from '@transformations/utils';

import { Flex, Icon } from '@cognite/cogs.js';

type DatabaseColumnProps = {
  onChange: (value: string) => void;
  value?: string;
};

const DatabaseColumn = ({
  onChange,
  value,
}: DatabaseColumnProps): JSX.Element => {
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
          $active={db.name === value}
          onClick={() => onChange(db.name)}
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
};

export default DatabaseColumn;
