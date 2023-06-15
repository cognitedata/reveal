import { useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import {
  useDatabases,
  useDebounce,
  useTables,
  useUpdateTransformation,
} from '@transformations/hooks';
import { TransformationRead } from '@transformations/types';
import {
  collectPages,
  shouldDisableUpdatesOnTransformation,
} from '@transformations/utils';
import { AutoComplete, Input } from 'antd';

import { Colors, Icon } from '@cognite/cogs.js';

import DestinationItem from './DestinationItem';

type DestinationRawConfigurationProps = {
  destination: TransformationRead['destination'] & { type: 'raw' };
  transformation: TransformationRead;
};

const DestinationRawConfiguration = ({
  destination,
  transformation,
}: DestinationRawConfigurationProps): JSX.Element => {
  const { t } = useTranslation();

  const { isLoading, mutate, reset } = useUpdateTransformation();

  const [databaseName, setDatabaseName] = useState(destination.database);
  const debouncedDatabaseName = useDebounce(databaseName, 500);

  const [tableName, setTableName] = useState(destination.table);
  const debouncedTableName = useDebounce(tableName, 500);

  const { data: dbData } = useDatabases();
  const { data: tableData } = useTables(
    { database: debouncedDatabaseName },
    { enabled: !!debouncedDatabaseName }
  );

  const databases = useMemo(() => collectPages(dbData), [dbData]);
  const tables = useMemo(() => collectPages(tableData), [tableData]);

  useEffect(() => {
    if (
      debouncedDatabaseName !== destination.database ||
      debouncedTableName !== destination.table
    ) {
      reset();
      mutate({
        id: transformation.id,
        update: {
          destination: {
            set: {
              database: debouncedDatabaseName,
              table: debouncedTableName,
              type: destination.type,
            },
          },
        },
      });
    }
  }, [
    debouncedDatabaseName,
    debouncedTableName,
    destination,
    transformation,
    mutate,
    reset,
  ]);

  return (
    <StyledDestinationConfigurationSection>
      <DestinationItem title={t('database_one')}>
        <AutoComplete
          disabled={shouldDisableUpdatesOnTransformation(transformation)}
          onChange={(value) => setDatabaseName(value)}
          value={databaseName}
          options={databases
            .filter((db) =>
              db.name.toLowerCase().startsWith(databaseName.toLowerCase())
            )
            .map((db) => ({ label: db.name, value: db.name }))}
        >
          <Input
            placeholder={t('create-database-placeholder')}
            suffix={
              isLoading && debouncedDatabaseName !== destination.database ? (
                <Icon type="Loader" />
              ) : (
                <></>
              )
            }
            size="small"
          />
        </AutoComplete>
      </DestinationItem>
      <DestinationItem title={t('table_one')}>
        <AutoComplete
          disabled={shouldDisableUpdatesOnTransformation(transformation)}
          onChange={(value) => setTableName(value)}
          value={tableName}
          options={tables
            .filter((tb) =>
              tb.name.toLowerCase().startsWith(tableName.toLowerCase())
            )
            .map((tb) => ({ label: tb.name, value: tb.name }))}
        >
          <Input
            placeholder={t('create-table-placeholder')}
            suffix={
              isLoading && debouncedTableName !== destination.table ? (
                <Icon type="Loader" />
              ) : (
                <></>
              )
            }
            size="small"
          />
        </AutoComplete>
      </DestinationItem>
    </StyledDestinationConfigurationSection>
  );
};

export const StyledDestinationConfigurationSection = styled.div`
  background-color: ${Colors['surface--medium']};
  border-radius: 4px;
  margin-bottom: 8px;
  padding: 12px;
`;

export default DestinationRawConfiguration;
