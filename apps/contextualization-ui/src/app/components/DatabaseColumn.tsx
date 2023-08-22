import {
  ReactElement,
  JSXElementConstructor,
  ReactFragment,
  Key,
  useMemo,
} from 'react';

import { InfiniteData } from '@tanstack/react-query';

import { Flex, Icon } from '@cognite/cogs.js';

import { useDatabases } from '../hooks/sdk-queries';

import {
  CenteredColumnContent,
  Column,
  Item,
  Label,
} from './TransformationComponents';

type Items<T> = {
  items: T[];
};

export const collectPages = <T extends { name: string }>(
  data: InfiniteData<Items<T>>
): T[] =>
  data
    ? data.pages.reduce((accl, page) => [...accl, ...page.items], [] as T[])
    : ([] as T[]);

type DatabaseColumnProps = {
  onChange: (value: string) => void;
  value?: string | null;
};

const DatabaseColumn = ({
  onChange,
  value,
}: DatabaseColumnProps): JSX.Element => {
  const { data, isSuccess, isInitialLoading } = useDatabases();

  const databases = useMemo(() => {
    return collectPages(data!).sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  return (
    <Column $border>
      <Label>Database</Label>
      {isInitialLoading && (
        <CenteredColumnContent>
          <Icon type="Loader" />
        </CenteredColumnContent>
      )}
      {isSuccess && databases?.length === 0 && (
        <CenteredColumnContent>No database found'</CenteredColumnContent>
      )}
      {databases?.map(
        (db: {
          name:
            | boolean
            | ReactElement<any, string | JSXElementConstructor<any>>
            | ReactFragment
            | Key
            | null
            | undefined;
        }) => (
          <Item
            $active={db.name === value}
            onClick={() => onChange(db.name as string)}
          >
            <Flex alignItems="center" gap={8}>
              <Icon type="DataSource" />
              {db.name}
            </Flex>
            <Icon type="ChevronRight" />
          </Item>
        )
      )}
    </Column>
  );
};

export default DatabaseColumn;
