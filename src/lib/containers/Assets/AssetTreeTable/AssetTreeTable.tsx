import React, { useEffect, useState, useMemo } from 'react';
import { Asset, AssetFilterProps } from '@cognite/sdk';
import styled from 'styled-components';
import { usePrevious } from 'lib/hooks/CustomHooks';
import { Loader, Table } from 'lib/components';
import { SelectableItemsProps } from 'lib/CommonProps';
import { useLoadListTree, useLoadSearchTree } from './hooks';

const PAGE_SIZE = 50;

export const AssetTreeTable = ({
  filter = {},
  query,
  onAssetClicked,
  activeIds = [],
  isSelected,
  disableScroll,
  startFromRoot = false,
  ...selectionProps
}: {
  filter: AssetFilterProps;
  query?: string;
  activeIds?: number[];
  onAssetClicked: (item: Asset) => void;
  startFromRoot?: boolean;
  disableScroll?: boolean;
} & SelectableItemsProps) => {
  const [listExpandedRowKeys, setListExpandedRowKeys] = useState<number[]>([]);
  const [searchExpandedRowKeys, setSearchExpandedRowKeys] = useState<number[]>(
    []
  );

  const searchEnabled = !!query && query.length > 0;

  const previousListExpandedRowKeys = usePrevious(listExpandedRowKeys);

  const columns = [
    Table.Columns.name,
    Table.Columns.description,
    Table.Columns.externalId,
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
  ];

  const [searchCount, setSearchCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setSearchCount(PAGE_SIZE);
  }, [query]);
  const [previewId, setPreviewId] = useState<number | undefined>(undefined);

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

  const {
    data: searchFiles,
    isFetched: searchFetched,
    refetch,
  } = useLoadSearchTree(query || '', filter, {
    enabled: searchEnabled,
  });

  const items = useMemo(() => {
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
    return searchFiles && searchFiles.reduce(reducer, [] as number[]);
  }, [searchFiles]);

  if (items && items !== searchExpandedRowKeys) {
    setSearchExpandedRowKeys(items);
  }

  const isLoading = searchEnabled ? !searchFetched : !listFetched;

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

  const selectedIds = useMemo(() => {
    const mergeChildren = (
      prev: number[],
      asset: { loading?: boolean; id: number; children?: any[] }
    ): number[] => {
      if (asset.loading) {
        return prev;
      }
      if (!asset.children) {
        return prev.concat([asset.id]);
      }
      return asset.children
        .reduce((iter: number[], child) => mergeChildren(iter, child), prev)
        .concat([asset.id]);
    };
    const ids = [...(assets || [])].reduce(mergeChildren, []);
    return ids.filter(id => {
      return isSelected({ type: 'asset', id });
    });
  }, [assets, isSelected]);

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
      activeIds={activeIds}
      columns={columns}
      fixed
      expandColumnKey="name"
      data={assets}
      selectedIds={selectedIds}
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
      emptyRenderer={() => {
        if (isLoading) {
          return (
            <LoaderWrapper>
              <Loader />
            </LoaderWrapper>
          );
        }
        return null;
      }}
      rowRenderer={({ rowData, cells }) => {
        // @ts-ignore
        // eslint-disable-next-line react/prop-types
        if (rowData.loading) {
          return <Loader />;
        }
        return cells;
      }}
      disableScroll={disableScroll}
      selectionMode={selectionProps.selectionMode}
      onRowSelected={item =>
        selectionProps.onSelect({ type: 'asset', id: item.id })
      }
    />
  );
};

const LoaderWrapper = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  background: rgba(256, 256, 256, 0.3);
  align-items: center;
  justify-content: center;
`;
