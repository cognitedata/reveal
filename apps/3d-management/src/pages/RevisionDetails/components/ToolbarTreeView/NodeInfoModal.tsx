import { useSelector } from 'react-redux';
import { RootState } from 'src/store';
import { getNodeByTreeIndex } from 'src/pages/RevisionDetails/components/TreeView/utils/treeFunctions';
import { TreeDataNode } from 'src/pages/RevisionDetails/components/TreeView/types';
import React, { useCallback, useEffect, useState } from 'react';
import Modal, { ModalProps } from 'antd/lib/modal';
import Table, { ColumnProps } from 'antd/lib/table';
import { Button } from '@cognite/cogs.js';
import Tabs from 'antd/lib/tabs';
import { getContainer } from 'src/utils';
import styled from 'styled-components';
import omit from 'lodash/omit';

type DataSource = {
  key: string;
  value: any;
};

// for some reason if Table is used as styled component, styles are not applied
const TableWrapper = styled.div`
  overflow: auto;
  max-height: max(65vh, 400px);
  & td,
  th {
    padding: 8px;
  }
`;

type Props = ModalProps & { treeIndex?: number; onClose: () => void };

const azSortByKey = (key) => (a, b) => {
  const aStr = String(a[key]).toLowerCase();
  const bStr = String(b[key]).toLowerCase();
  if (aStr > bStr) {
    return 1;
  }
  if (aStr < bStr) {
    return -1;
  }
  return 0;
};

export const NodeInfoModal = ({ treeIndex, onClose, ...restProps }: Props) => {
  const defaultCdfMetaTabKey = 'cdfMetaTabKey';
  const [activeTabKey, setActiveTabKey] = useState<null | string>(null);
  const [nodeKeys, setNodeKeys] = useState<Array<string>>([]);

  const node = useSelector(
    useCallback(
      (app: RootState) => {
        if (treeIndex == null) {
          return null;
        }
        const treeNode = getNodeByTreeIndex(
          app.treeView.treeData,
          treeIndex
        ) as TreeDataNode | undefined;
        return treeNode && treeNode.meta;
      },
      [treeIndex]
    )
  );

  useEffect(() => {
    if (!node) {
      return;
    }
    const properties = node.properties || {};
    const newNodeKeys = Object.keys(properties);
    // custom "sorting" to make the most useful categories appear on the first place
    const bubbleUpProp = (key: string) => {
      if (key in properties) {
        newNodeKeys.unshift(newNodeKeys.splice(newNodeKeys.indexOf(key), 1)[0]);
      }
    };
    bubbleUpProp('Item');
    bubbleUpProp('PDMS');
    setNodeKeys(newNodeKeys);
  }, [node]);

  useEffect(() => {
    if (
      (activeTabKey && nodeKeys.includes(activeTabKey)) ||
      activeTabKey === defaultCdfMetaTabKey
    ) {
      return;
    }
    const setDefaultActiveTab = (key: string) => {
      if (nodeKeys.includes(key)) {
        setActiveTabKey(key);
      }
    };
    setDefaultActiveTab('Item');
    setDefaultActiveTab('PDMS');
  }, [JSON.stringify(nodeKeys.slice().sort())]);

  if (!node) {
    return null;
  }

  const getTableDataSource = (tabKey: string): DataSource[] => {
    let data;
    if (tabKey === defaultCdfMetaTabKey) {
      data = omit(node, 'properties');
    } else {
      data = (node.properties || {})[tabKey];
    }

    if (!data) {
      if (tabKey !== defaultCdfMetaTabKey) {
        return getTableDataSource(defaultCdfMetaTabKey);
      }
      return [];
    }

    return Object.entries(data).map(([key, value]) => {
      return {
        key,
        value:
          typeof value === 'object' ? (
            <pre style={{ font: 'inherit' }}>
              {JSON.stringify(value, null, 2)}
            </pre>
          ) : (
            value
          ),
      };
    });
  };

  const getColumns = (
    columns: Array<{ title: ColumnProps<DataSource>['title']; key: string }>
  ): Array<ColumnProps<DataSource>> => {
    return columns.map((col) => ({
      ...col,
      dataIndex: col.key,
      defaultSortOrder: 'ascend',
      sortDirections: ['ascend', 'descend', 'ascend'],
      sorter: azSortByKey(col.key),
    }));
  };

  return (
    <Modal
      width={800}
      title="Node properties"
      footer={[
        <Button key="submit" type="primary" onClick={onClose}>
          OK
        </Button>,
      ]}
      onCancel={onClose}
      onOk={onClose}
      getContainer={getContainer}
      {...restProps}
    >
      <Tabs
        type="card"
        activeKey={activeTabKey || defaultCdfMetaTabKey}
        onChange={setActiveTabKey}
      >
        {nodeKeys.map((key) => (
          <Tabs.TabPane key={key} tab={key} />
        ))}
        <Tabs.TabPane key={defaultCdfMetaTabKey} tab="CDF Metadata" />
      </Tabs>

      <TableWrapper>
        <Table
          dataSource={getTableDataSource(activeTabKey || defaultCdfMetaTabKey)}
          rowKey={(item) => item.key}
          columns={getColumns([
            {
              title: () => <b>Property</b>,
              key: 'key',
            },
            {
              title: () => <b>Value</b>,
              key: 'value',
            },
          ])}
          pagination={false}
        />
      </TableWrapper>
    </Modal>
  );
};
