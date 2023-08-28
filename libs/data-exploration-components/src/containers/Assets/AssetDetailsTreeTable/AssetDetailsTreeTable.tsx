import React, { useEffect, useState, useMemo } from 'react';

import {
  HighlightCell,
  getTableColumns,
  Table,
} from '@data-exploration/components';
import {
  useAssetsMetadataColumns,
  useRootPath,
} from '@data-exploration/containers';
import {
  SelectableItemsProps,
  TableStateProps,
} from '@data-exploration-components/types';
import { ColumnDef } from '@tanstack/react-table';
import { ExpandedState } from '@tanstack/table-core';
import gt from 'lodash/gt';

import { Icon } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';

import {
  DASH,
  getHiddenColumns,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  useRootAssetsQuery,
  InternalAssetTreeData,
} from '@data-exploration-lib/domain-layer';

const visibleColumns = ['name', 'rootId'];

export const AssetDetailsTreeTable = ({
  assetId,
  rootAssetId,
  onAssetClicked,
  selectedRows,
  scrollIntoViewRow,
  tableSubHeaders,
}: {
  assetId: number;
  rootAssetId: number;
  onAssetClicked: (item: Asset) => void;
  selectedRows?: Record<string, boolean>;
  scrollIntoViewRow?: string | number; //Scroll into center row when the selectedRows changes
  tableSubHeaders?: React.ReactElement;
} & SelectableItemsProps &
  TableStateProps) => {
  const [rootExpanded, setRootExpanded] = useState<ExpandedState>({});

  const { metadataColumns, setMetadataKeyQuery } = useAssetsMetadataColumns();

  const rootExpandedKeys = useMemo(() => {
    return Object.keys(rootExpanded).reduce((previousValue, currentValue) => {
      return [...previousValue, Number(currentValue)];
    }, [] as number[]);
  }, [rootExpanded]);

  const { data: rootAssetTree } = useRootAssetsQuery(
    rootExpandedKeys,
    rootAssetId
  );

  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);

  const columns = React.useMemo(
    () =>
      [
        {
          ...tableColumns.name(),
          enableHiding: false,
          cell: ({ row, getValue }) => (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                paddingLeft: `${row.depth * 2}rem`,
              }}
            >
              {row.getCanExpand() && (
                <Icon
                  type={row.getIsExpanded() ? 'ChevronUp' : 'ChevronDown'}
                  {...{
                    onClick: (event: any) => {
                      event.preventDefault();
                      event.stopPropagation();
                      row.toggleExpanded();
                    },
                    style: {
                      cursor: 'pointer',
                      marginRight: '8px',
                      height: '16px',
                      flexShrink: 0,
                    },
                  }}
                />
              )}
              <HighlightCell text={getValue<string>() || DASH} lines={1} />
            </div>
          ),
        },
        tableColumns.description(),
        tableColumns.externalId(),
        {
          id: 'childCount',
          header: t('DIRECT_CHILDREN', 'Direct children'),
          accessorKey: 'aggregates',
          cell: ({ getValue }) => {
            return (
              <span>
                {getValue() && getValue<{ childCount: number }>()?.childCount
                  ? getValue<{ childCount: number }>()?.childCount
                  : DASH}
              </span>
            );
          },
          size: 300,
        },
        tableColumns.availabilityThreeD,
        tableColumns.source(),
        ...metadataColumns,
      ] as ColumnDef<InternalAssetTreeData>[],
    [metadataColumns]
  );

  const { data: rootPath, isFetched: rootPathFetched } = useRootPath(assetId);

  useEffect(() => {
    if (rootPath && rootPathFetched) {
      setRootExpanded(
        rootPath.reduce((previousValue, currentValue) => {
          return {
            ...previousValue,
            [currentValue]: true,
          };
        }, {})
      );
    }
  }, [rootPathFetched, rootPath]);

  const hiddenColumns = getHiddenColumns(columns, visibleColumns);

  return (
    <Table<InternalAssetTreeData>
      id="asset-details-tree-table"
      data={rootAssetTree || []}
      columns={columns}
      enableExpanding
      selectedRows={selectedRows}
      scrollIntoViewRow={scrollIntoViewRow}
      getCanRowExpand={(row) => {
        return gt(row.original.aggregates?.childCount, 0);
      }}
      getSubrowData={(originalRow) => {
        return originalRow.children;
      }}
      expandedRows={rootExpanded}
      onRowClick={onAssetClicked}
      tableSubHeaders={tableSubHeaders}
      hiddenColumns={hiddenColumns}
      onRowExpanded={(expanded) => {
        setRootExpanded(expanded);
      }}
      onChangeSearchInput={setMetadataKeyQuery}
    />
  );
};
