import React, { useEffect, useState, useMemo } from 'react';
import { Asset } from '@cognite/sdk';
import { useSelectionCheckbox } from 'hooks/useSelection';
import {
  useResourceMode,
  useResourcesState,
} from 'context/ResourceSelectionContext';
import { Loader, Table } from 'components/Common';
import { usePrevious } from 'hooks/CustomHooks';
import { useLoadListTree, useLoadSearchTree } from './AssetTreeTableHooks';

const PAGE_SIZE = 50;

const ActionCell = ({ asset }: { asset: Asset }) => {
  const getButton = useSelectionCheckbox();
  return getButton({ id: asset.id, type: 'asset' });
};

export const AssetTreeTable = ({
  filter = {},
  query,
  onAssetClicked,
  startFromRoot = false,
}: {
  filter: any;
  query?: string;
  onAssetClicked: (item: Asset) => void;
  startFromRoot?: boolean;
}) => {
  const [listExpandedRowKeys, setListExpandedRowKeys] = useState<number[]>([]);
  const [searchExpandedRowKeys, setSearchExpandedRowKeys] = useState<number[]>(
    []
  );
  const { mode } = useResourceMode();

  const searchEnabled = !!query && query.length > 0;

  const previousListExpandedRowKeys = usePrevious(listExpandedRowKeys);

  const columns = [
    Table.Columns.name,
    {
      ...Table.Columns.description,
      width: 400,
    },
    {
      key: 'childCount',
      title: searchEnabled ? 'Results under asset' : 'Direct children',
      cellRenderer: ({ rowData: asset }: { rowData: Asset }) => {
        return (
          <span>
            {asset.aggregates && !!asset.aggregates.childCount
              ? asset.aggregates.childCount
              : 'N/A'}
          </span>
        );
      },
      width: 300,
    },
    ...(mode !== 'none'
      ? [
          {
            ...Table.Columns.select,
            cellRenderer: ({ rowData: asset }: { rowData: Asset }) => {
              return <ActionCell asset={asset} />;
            },
          },
        ]
      : []),
  ];

  const [searchCount, setSearchCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setSearchCount(PAGE_SIZE);
  }, [query]);
  const [previewId, setPreviewId] = useState<number | undefined>(undefined);

  const { resourcesState } = useResourcesState();
  const currentItems = resourcesState.filter(el => el.state === 'active');

  const onItemSelected = (file: Asset) => {
    onAssetClicked(file);
    setPreviewId(file.id);
  };

  const { data: listItems, isFetched: listFetched } = useLoadListTree(
    startFromRoot ? { ...filter, root: true } : filter,
    listExpandedRowKeys
  );
  const { data: oldListItems } = useLoadListTree(
    startFromRoot ? { ...filter, root: true } : filter,
    previousListExpandedRowKeys
  );

  const { data: searchFiles, refetch } = useLoadSearchTree(
    query || '',
    filter,
    {
      enabled: searchEnabled,
    },
    {
      onSuccess: data => {
        const reducer = (
          prev: number[],
          el: Asset & { children?: Asset[] }
        ): number[] => {
          if (el.children) {
            const childrenIds = (el.children || []).reduce(reducer, prev);
            return childrenIds.concat([el.id]);
          }
          return prev;
        };
        const items = data.reduce(reducer, [] as number[]);
        setSearchExpandedRowKeys(items);
      },
    }
  );

  const assets = useMemo(() => {
    if (searchEnabled) {
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

      return (searchFiles || []).map((el: Asset) => ({
        ...el,
        aggregates: { childCount: count(el) },
      }));
    }
    if (listFetched) {
      return listItems;
    }
    return oldListItems;
  }, [searchEnabled, searchFiles, listFetched, listItems, oldListItems]);

  useEffect(() => {
    if (searchEnabled) {
      refetch();
    }
  }, [searchCount, searchEnabled, refetch]);

  return (
    <Table<Asset>
      rowEventHandlers={{
        onClick: ({ rowData: file, event }) => {
          onItemSelected(file);
          return event;
        },
      }}
      query={query}
      previewingIds={previewId ? [previewId] : undefined}
      activeIds={currentItems.map(el => el.id)}
      columns={columns}
      fixed
      expandColumnKey="name"
      data={assets}
      expandedRowKeys={
        searchEnabled ? searchExpandedRowKeys : listExpandedRowKeys
      }
      onExpandedRowsChange={ids => {
        if (searchEnabled) {
          setSearchExpandedRowKeys(ids as number[]);
        } else {
          setListExpandedRowKeys(ids as number[]);
        }
      }}
      rowRenderer={({ rowData, cells }) => {
        // @ts-ignore
        // eslint-disable-next-line react/prop-types
        if (rowData.loading) {
          return <Loader />;
        }
        return cells;
      }}
    />
  );
};
