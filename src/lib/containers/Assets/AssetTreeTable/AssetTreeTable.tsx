import React, { useEffect, useState, useMemo } from 'react';
import { Asset, AssetFilterProps } from '@cognite/sdk';
import styled from 'styled-components';
import { usePrevious } from 'lib/hooks/CustomHooks';
import { Loader, Table } from 'lib/components';
import { SelectableItemsProps, TableStateProps } from 'lib/CommonProps';
import { useRootTree, useSearchTree } from './hooks';

export const AssetTreeTable = ({
  filter = {},
  query,
  onAssetClicked,
  activeIds = [],
  isSelected,
  disableScroll,
  ...selectionProps
}: {
  filter: AssetFilterProps;
  query?: string;
  onAssetClicked: (item: Asset) => void;
  disableScroll?: boolean;
} & SelectableItemsProps &
  TableStateProps) => {
  const [previewId, setPreviewId] = useState<number | undefined>(undefined);
  const onItemSelected = (asset: Asset) => {
    onAssetClicked(asset);
    setPreviewId(asset.id);
  };

  // search* variables in this component refers to both /search with and without filter and /list
  // with a filter. rootOnly is just for /list without filter.
  const [rootExpandedKeys, setRootExpandedKeys] = useState<number[]>([]);
  const [searchExpandedKeys, setSearchExpandedKeys] = useState<number[]>([]);
  const startFromRoot =
    (!query || query === '') &&
    Object.values(filter).filter(Boolean).length === 0;

  const expandCount = startFromRoot
    ? rootExpandedKeys.length
    : searchExpandedKeys.length;

  const columns = [
    {
      ...Table.Columns.name,
      width: expandCount > 0 ? 500 : Table.Columns.name.width,
    },
    Table.Columns.description,
    Table.Columns.externalId,
    {
      key: 'childCount',
      title: startFromRoot ? 'Direct children' : 'Results under asset',
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

  const { data: searchItems, isFetched: searchFetched } = useSearchTree(
    filter,
    query,
    {
      enabled: !startFromRoot,
    }
  );

  useEffect(() => {
    if (searchItems) {
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
      const expandedSearchKeys = searchItems.reduce(reducer, [] as number[]);
      setSearchExpandedKeys(expandedSearchKeys);
    } else {
      setSearchExpandedKeys([] as number[]);
    }
  }, [searchItems, setSearchExpandedKeys]);

  const isLoading = startFromRoot ? !rootFetched : !searchFetched;

  const assets = useMemo(() => {
    if (startFromRoot) {
      if (rootFetched) {
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
  }, [startFromRoot, searchItems, rootFetched, rootItems, oldRootItems]);

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
      expandedRowKeys={startFromRoot ? rootExpandedKeys : searchExpandedKeys}
      onExpandedRowsChange={ids => {
        if (startFromRoot) {
          setRootExpandedKeys(ids as number[]);
        } else {
          setSearchExpandedKeys(ids as number[]);
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
