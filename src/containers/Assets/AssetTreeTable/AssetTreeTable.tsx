import { ColumnDef } from '@tanstack/react-table';
import { ExpandedState } from '@tanstack/table-core';
import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { Asset } from '@cognite/sdk';
import { useGetHiddenColumns, usePrevious } from 'hooks/CustomHooks';
import { SelectableItemsProps, TableStateProps } from 'types';
import { HighlightCell, ResourceTableColumns } from '../../../components';
import { Table } from '../../../components';
import { EmptyState } from '../../../components/EmpyState/EmptyState';
import { useSearchAssetTree } from '../../../domain';
import { useRootAssetsQuery } from '../../../domain';
import { DASH } from '../../../utils';
import { AssetWithRelationshipLabels } from '../AssetTable/AssetTable';
import { useRootTree, useSearchTree, useRootPath } from './hooks';
import { ThreeDModelCell } from '../AssetTable/ThreeDModelCell';
import {
  InternalAssetFilters,
  InternalAssetTreeData,
  useAssetsMetadataKeys,
} from 'domain/assets';
import gt from 'lodash/gt';
import { Icon } from '@cognite/cogs.js';

const visibleColumns = ['name', 'rootId'];

export const AssetTreeTable = ({
  filter = {},
  query,
  onAssetClicked,
  selectedRows,
  hierachyRootId,
  tableHeaders,
  enableAdvancedFilters,
  scrollIntoViewRow,
  tableSubHeaders,
}: {
  filter: InternalAssetFilters;
  query?: string;
  onAssetClicked: (item: Asset) => void;
  hierachyRootId?: number;
  disableScroll?: boolean;
  tableHeaders?: React.ReactElement;
  enableAdvancedFilters?: boolean;
  selectedRows?: Record<string, boolean>;
  scrollIntoViewRow?: string | number; //Scroll into center row when the selectedRows changes
  tableSubHeaders?: React.ReactElement;
} & SelectableItemsProps &
  TableStateProps) => {
  const [rootExpanded, setRootExpanded] = useState<ExpandedState>({});
  const [searchExpanded, setSearchExpanded] = useState<ExpandedState>({});

  const { data: metadataKeys } = useAssetsMetadataKeys();

  const rootExpandedKeys = useMemo(() => {
    return Object.keys(rootExpanded).reduce((previousValue, currentValue) => {
      return [...previousValue, Number(currentValue)];
    }, [] as number[]);
  }, [rootExpanded]);

  const rootAssetTree = useRootAssetsQuery(rootExpandedKeys);
  const {
    data: searchAssetTree,
    fetchNextPage,
    hasNextPage,
  } = useSearchAssetTree({
    query,
    assetFilter: filter,
    sortBy: [],
  });

  const startFromRoot = useMemo(() => {
    return (
      (!query || query === '') &&
      Object.values(filter).filter(Boolean).length === 0
    );
  }, [query, filter]);

  const metadataColumns: ColumnDef<AssetWithRelationshipLabels>[] =
    useMemo(() => {
      return (metadataKeys || []).map((key: string) =>
        ResourceTableColumns.metadata(key)
      );
    }, [metadataKeys]);

  const columns = React.useMemo(
    () =>
      [
        {
          header: 'Name',
          accessorKey: 'name',
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
                    onClick: event => {
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
              <HighlightCell
                text={getValue<string>() || DASH}
                lines={1}
                query={query}
              />
            </div>
          ),
        },
        Table.Columns.description(query),
        Table.Columns.externalId,
        {
          id: 'childCount',
          header: startFromRoot ? 'Direct children' : 'Results under asset',
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
        {
          id: 'threeDModels',
          header: '3D availability',
          cell: ({ row }) => <ThreeDModelCell assetId={row.original.id} />,
          size: 300,
        },
        ...metadataColumns,
      ] as ColumnDef<InternalAssetTreeData>[],
    [query, startFromRoot, metadataColumns]
  );

  const previousRootExpandedKeys = usePrevious(rootExpandedKeys);

  const { data: rootItems, isFetched: rootFetched } = useRootTree(
    rootExpandedKeys,
    {
      enabled: startFromRoot,
    }
  );

  const { data: oldRootItems } = useRootTree(previousRootExpandedKeys, {
    enabled: startFromRoot,
  });

  const { data: searchItems } = useSearchTree(filter, query, {
    enabled: !startFromRoot,
  });

  const assetId = useMemo(() => {
    if (selectedRows && Object.keys(selectedRows).length === 1) {
      return Number(Object.keys(selectedRows)[0]);
    }

    return undefined;
  }, [selectedRows]);

  const { data: rootPath, isFetched: rootPathFetched } = useRootPath(assetId);

  useEffect(() => {
    if (startFromRoot && rootPath && rootPathFetched) {
      setRootExpanded(
        rootPath.reduce((previousValue, currentValue) => {
          return {
            ...previousValue,
            [currentValue]: true,
          };
        }, {})
      );
    }
  }, [rootPathFetched, rootPath, startFromRoot]);

  useEffect(() => {
    if (searchItems) {
      // this automatically expands all rows
      setSearchExpanded(true);
    } else {
      setSearchExpanded({});
    }
  }, [searchItems]);

  // const isLoading = startFromRoot ? !rootFetched : !searchFetched;

  const assets = useMemo(() => {
    if (startFromRoot) {
      if (rootFetched) {
        if (hierachyRootId) {
          return rootItems?.filter(item => item.id === hierachyRootId);
        }
        return rootItems;
      }
      return oldRootItems;
    }

    const count = (
      asset: Asset & {
        children?: Asset[] | undefined;
      }
    ): number => {
      if (asset.children) {
        const childCount = asset.children.reduce(
          (prev, el) => prev + count(el),
          0
        );
        asset.aggregates = { childCount };
        return childCount;
      }
      return 1;
    };

    return (searchItems || []).map((el: Asset) => ({
      ...el,
      aggregates: { childCount: count(el) },
    }));
  }, [
    startFromRoot,
    searchItems,
    rootFetched,
    oldRootItems,
    hierachyRootId,
    rootItems,
  ]);

  const getData = () => {
    if (enableAdvancedFilters) {
      if (startFromRoot) {
        return rootAssetTree || [];
      }

      return searchAssetTree;
    }

    return assets as InternalAssetTreeData[];
  };

  const hiddenColumns = useGetHiddenColumns(columns, visibleColumns);

  return (
    <Suspense fallback={<EmptyState isLoading={true} />}>
      <Table<InternalAssetTreeData>
        id={'asset-tree-table'}
        data={getData()}
        columns={columns}
        tableHeaders={tableHeaders}
        enableExpanding
        selectedRows={selectedRows}
        showLoadButton={!startFromRoot}
        scrollIntoViewRow={scrollIntoViewRow}
        hasNextPage={hasNextPage}
        fetchMore={fetchNextPage}
        getCanRowExpand={
          startFromRoot
            ? row => {
                return gt(row.original.aggregates?.childCount, 0);
              }
            : undefined
        }
        getSubrowData={originalRow => {
          return originalRow.children;
        }}
        expandedRows={startFromRoot ? rootExpanded : searchExpanded}
        onRowClick={onAssetClicked}
        tableSubHeaders={tableSubHeaders}
        hiddenColumns={hiddenColumns}
        onRowExpanded={expanded => {
          if (startFromRoot) {
            setRootExpanded(expanded);
          } else {
            setSearchExpanded(expanded);
          }
        }}
      />
    </Suspense>
  );
};
