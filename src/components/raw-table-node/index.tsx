import { useMemo, useState } from 'react';

import { RawDB, RawDBTable } from '@cognite/sdk';
import { NodeProps } from 'react-flow-renderer';

import { NodeData } from 'components/custom-node';
import { BaseNode } from 'components/base-node';
import { useTranslation } from 'common';
import SelectWithCreate from 'components/select-with-create';
import {
  useCreateDatabase,
  useCreateTable,
  useDatabases,
  useTables,
} from 'hooks/raw';
import { collectPages } from 'utils';
import { Button, Flex } from '@cognite/cogs.js';
import { useNavigate } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';

export type RawNodeData = NodeData<
  'raw-table',
  {
    database?: string;
    table?: string;
  }
>;

export const RawTableNode = (_: NodeProps<RawNodeData>): JSX.Element => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const [selectedDatabase, setSelectedDatabase] = useState<string>();
  const [selectedTable, setSelectedTable] = useState<string>();

  const { data: databases } = useDatabases();
  const { data: tables } = useTables(
    { database: selectedDatabase ?? '' },
    { enabled: !!selectedDatabase }
  );
  const { mutate: createDatabase, isLoading: isCreatingDatabase } =
    useCreateDatabase();
  const { mutate: createTable, isLoading: isCreatingTable } = useCreateTable();

  const databaseOptions = useMemo(() => {
    const list = collectPages<RawDB>(databases);
    return list.map(({ name }) => ({ label: name, value: name }));
  }, [databases]);
  const tableOptions = useMemo(() => {
    const list = collectPages<RawDBTable>(tables);
    return list.map(({ name }) => ({ label: name, value: name }));
  }, [tables]);

  const handleDatabaseCreate = (value: string) => {
    createDatabase({ name: value });
  };

  const handleDatabaseSelect = (value?: string) => {
    if (value !== selectedDatabase) {
      setSelectedTable(undefined);
    }
    setSelectedDatabase(value);
  };

  const handleTableCreate = (value: string) => {
    if (selectedDatabase) {
      createTable({ database: selectedDatabase, table: value });
    }
  };

  const handleTableSelect = (value?: string) => {
    setSelectedTable(value);
  };

  return (
    <BaseNode
      icon="DataTable"
      title={t('raw-table', { postProcess: 'uppercase' })}
    >
      <Flex direction="column" gap={8}>
        <SelectWithCreate
          className="nodrag"
          loading={isCreatingDatabase}
          onClear={() => handleDatabaseSelect(undefined)}
          onCreate={handleDatabaseCreate}
          onSelect={handleDatabaseSelect}
          optionLabelProp="label"
          options={databaseOptions}
          titleI18nKey="database"
          value={selectedDatabase}
        />
        {!!selectedDatabase && (
          <SelectWithCreate
            className="nodrag"
            loading={isCreatingTable}
            onClear={() => handleTableSelect(undefined)}
            onCreate={handleTableCreate}
            onSelect={handleTableSelect}
            optionLabelProp="label"
            options={tableOptions}
            titleI18nKey="table"
            value={selectedTable}
          />
        )}
        {!!selectedDatabase && !!selectedTable && (
          <Button
            onClick={() =>
              navigate(
                createLink(`/raw`, {
                  activeTable: `["${selectedDatabase}","${selectedTable}",null]`,
                  tabs: `[["${selectedDatabase}","${selectedTable}",null]]`,
                })
              )
            }
          >
            {t('view')}
          </Button>
        )}
      </Flex>
    </BaseNode>
  );
};
