import { useCallback, useMemo } from 'react';

import { RawDB, RawDBTable } from '@cognite/sdk';
import { NodeProps, useReactFlow } from 'react-flow-renderer';

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

export const RawTableNode = ({
  data,
  id,
}: NodeProps<RawNodeData>): JSX.Element => {
  const { extraProps = {} } = data;
  const { database: selectedDatabase, table: selectedTable } = extraProps;

  const { t } = useTranslation();

  const navigate = useNavigate();

  const { setNodes } = useReactFlow();

  const { data: databases } = useDatabases();
  const { data: tables } = useTables(
    { database: selectedDatabase ?? '' },
    { enabled: !!selectedDatabase }
  );
  const { mutateAsync: createDatabase, isLoading: isCreatingDatabase } =
    useCreateDatabase();
  const { mutateAsync: createTable, isLoading: isCreatingTable } =
    useCreateTable();

  const databaseOptions = useMemo(() => {
    const list = collectPages<RawDB>(databases);
    return list.map(({ name }) => ({ label: name, value: name }));
  }, [databases]);
  const tableOptions = useMemo(() => {
    const list = collectPages<RawDBTable>(tables);
    return list.map(({ name }) => ({ label: name, value: name }));
  }, [tables]);

  const updateRawNode = useCallback(
    (extraProps: RawNodeData['extraProps']) => {
      setNodes((prevNodes) => {
        return prevNodes.map((node) => {
          const { id: testId } = node;
          if (testId === id) {
            return { ...node, data: { ...node.data, extraProps } };
          }
          return node;
        });
      });
    },
    [id, setNodes]
  );

  const handleDatabaseClear = () => {
    updateRawNode({
      database: undefined,
      table: undefined,
    });
  };

  const handleDatabaseCreate = (value: string) => {
    createDatabase({ name: value }).then(() => {
      updateRawNode({
        database: value,
        table: undefined,
      });
    });
  };

  const handleDatabaseSelect = (value: string) => {
    if (value !== selectedDatabase) {
      updateRawNode({
        database: value,
        table: undefined,
      });
    }
  };

  const handleTableClear = () => {
    updateRawNode({
      database: selectedDatabase,
      table: undefined,
    });
  };

  const handleTableCreate = (value: string) => {
    if (selectedDatabase) {
      createTable({ database: selectedDatabase, table: value }).then(() => {
        updateRawNode({
          database: selectedDatabase,
          table: value,
        });
      });
    }
  };

  const handleTableSelect = (value: string) => {
    if (value !== selectedTable) {
      updateRawNode({
        database: selectedDatabase,
        table: value,
      });
    }
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
          onClear={handleDatabaseClear}
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
            onClear={handleTableClear}
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
