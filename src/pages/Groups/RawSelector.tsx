import React, { useState, useEffect } from 'react';

import { Icon } from '@cognite/cogs.js';
import { CogniteClient } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { TreeSelect, Tooltip } from 'antd';
import styled from 'styled-components';
import unionBy from 'lodash/unionBy';

import { getContainer } from 'utils/utils';

const TreeLabel = styled.span`
  margin: 0 8px;
`;

const createDatabaseTitle = (name: string) => (
  <Tooltip
    title={`Scope to all current and future tables of ${name}. Specific table scopes will be ignored.`}
  >
    <Icon type="DataTable" />
    <TreeLabel>{name}</TreeLabel>
  </Tooltip>
);

const createTableTitle = (name: string) => (
  <>
    <Icon type="DataTable" />
    <TreeLabel>{name}</TreeLabel>
  </>
);

const dbTableSeparator = '43jf5aBPMnMI';

const flattenScopeList = (rawScopes: any[]) => {
  const dbsToTables = rawScopes.reduce((prev, cur) => {
    if (cur.dbName in prev) {
      // Merge together entries against the same database
      const prevTables = prev[cur.dbName].tables;
      if (prevTables.length === 0) {
        return prev; // Previous record was a database, and that got precedence
      }

      if (cur.tableName) {
        prevTables.push(cur.tableName);
        return prev;
      }
    }

    if (cur.tableName) {
      return { ...prev, [cur.dbName]: { tables: [cur.tableName] } };
    }

    return { ...prev, [cur.dbName]: { tables: [] } };
  }, {});

  return {
    dbsToTables,
  };
};

const extractDbTableInfo = (value: string) => {
  const seperatorIdx = value.indexOf(dbTableSeparator);
  if (seperatorIdx >= 0) {
    return {
      dbName: value.slice(0, seperatorIdx),
      tableName: value.slice(seperatorIdx + dbTableSeparator.length),
    };
  }
  return {
    dbName: value,
  };
};

const createInitialSelection = (scope: any) => {
  const initialSelection: string[] = [];
  const dbsToLoad: string[] = [];

  const { dbsToTables } = scope;

  if (dbsToTables) {
    Object.keys(dbsToTables).forEach(dbName => {
      const { tables } = dbsToTables[dbName];
      if (tables && tables.length > 0) {
        dbsToLoad.push(dbName);
        const newItems = tables.map(
          (tableName: string) => `${dbName}${dbTableSeparator}${tableName}`
        );
        initialSelection.splice(initialSelection.length - 1, 0, ...newItems);
      } else {
        initialSelection.push(dbName);
      }
    });
  }

  return [initialSelection, dbsToLoad];
};

const loadTreeTables = async (dbName: string, sdk: CogniteClient) => {
  const tables = await sdk.raw
    .listTables(dbName)
    .autoPagingToArray({ limit: -1 });
  const treeTables = tables.map(table => ({
    id: `${dbName}${dbTableSeparator}${table.name}`,
    pId: dbName,
    value: `${dbName}${dbTableSeparator}${table.name}`,
    title: createTableTitle(table.name),
    isLeaf: true,
  }));
  return treeTables;
};

type Props = {
  value: any;
  onChange: (_: any) => void;
};
const RawSelector = ({ value, onChange }: Props) => {
  const sdk = useSDK();
  const [selection, setSelection] = useState<any[]>([]);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [initialDbsLoaded, setInitialDbsLoaded] = useState<any[]>([]);

  const loadInitialData = async () => {
    const databases = await sdk.raw
      .listDatabases()
      .autoPagingToArray({ limit: -1 });

    let tree = databases.map(database => ({
      id: database.name,
      pId: 0,
      value: database.name,
      title: createDatabaseTitle(database.name),
    }));

    const [initialSelection, dbsToLoad] = createInitialSelection(value);

    if (dbsToLoad) {
      const dbsPromises = dbsToLoad.map(db => loadTreeTables(db, sdk));
      const dbsData = await Promise.all(dbsPromises);
      // @ts-ignore
      tree = [...tree, ...dbsData.flat()];
    }

    // @ts-ignore
    setTreeData(tree);
    // @ts-ignore
    setSelection(initialSelection);
    // @ts-ignore
    setInitialDbsLoaded(dbsToLoad);
  };

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLoadData = async (treeNode: any) => {
    const { value: dbName } = treeNode.props;
    const newTables = await loadTreeTables(dbName, sdk);
    const newTreeData = unionBy(treeData, newTables, 'id');
    setTreeData(newTreeData);
  };

  const handleChange = (values: any[]) => {
    setSelection(values);
    onChange(flattenScopeList(values.map(extractDbTableInfo)));
  };

  return (
    <TreeSelect
      getPopupContainer={getContainer}
      showSearch
      treeDataSimpleMode
      treeData={treeData}
      value={selection}
      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
      placeholder="Select databases or tables"
      allowClear
      multiple
      loadData={onLoadData}
      onChange={handleChange}
      treeDefaultExpandedKeys={initialDbsLoaded}
    />
  );
};

export default RawSelector;
