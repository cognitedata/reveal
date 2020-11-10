import React from 'react';
import { List, Button } from 'antd';
import InfiniteScroll from 'react-infinite-scroller';
import {
  FileInfo,
  Asset,
  CogniteEvent,
  Timeseries,
  Sequence,
} from '@cognite/sdk';
import { Icon, Colors } from '@cognite/cogs.js';

import { SdkResourceType } from '@cognite/sdk-react-query-hooks';
import { useResourceResults } from 'lib/components/Search/SearchPageTable/hooks';

type ResourceType = FileInfo | Asset | CogniteEvent | Sequence | Timeseries;

const SearchResult = <T extends ResourceType>({
  api,
  query,
  filter = {},
  onRowClick,
  getTitle,
  getDescription,
  currentId,
}: {
  api: SdkResourceType;
  query?: string;
  filter?: any;
  onRowClick: (id: number) => void;
  getTitle: (i: T) => string;
  getDescription: (i: T) => string;
  currentId?: number;
}) => {
  const {
    isFetched,
    canFetchMore,
    isFetchingMore,
    fetchMore,
    items,
  } = useResourceResults<T>(api, query, filter);

  return (
    <InfiniteScroll
      initialLoad={false}
      pageStart={0}
      loadMore={() => fetchMore()}
      hasMore={canFetchMore}
      useWindow={false}
    >
      <List
        loading={!isFetched}
        dataSource={items}
        renderItem={item => (
          <List.Item
            key={item.id}
            style={
              item.id === currentId
                ? { backgroundColor: Colors['greyscale-grey1'].hex() }
                : undefined
            }
          >
            <div>
              <div>
                <Button type="link" onClick={() => onRowClick(item.id)}>
                  {getTitle(item)}
                </Button>
              </div>
              <div>
                <p>{getDescription(item)}</p>
              </div>
            </div>
          </List.Item>
        )}
      >
        {isFetchingMore && (
          <div className="demo-loading-container">
            <Icon type="Loading" />
          </div>
        )}
      </List>
    </InfiniteScroll>
  );
};

export const SearchResultList = (props: {
  api: SdkResourceType;
  query?: string;
  filter?: any;
  onRowClick: (id: number) => void;
  currentId?: number;
}) => {
  switch (props.api) {
    case 'assets':
      return (
        <SearchResult<Asset>
          {...props}
          getTitle={i => i.name}
          getDescription={i => i.description || ''}
        />
      );
    case 'timeseries':
      return (
        <SearchResult<Timeseries>
          {...props}
          getTitle={i => i.name || `${i.id}`}
          getDescription={i => i.description || ''}
        />
      );
    case 'files':
      return (
        <SearchResult<FileInfo>
          {...props}
          getTitle={i => i.name || `${i.id}`}
          getDescription={i => i.mimeType || ''}
        />
      );
    case 'events':
      return (
        <SearchResult<CogniteEvent>
          {...props}
          getTitle={i => `${i.type} - ${i.subtype}`}
          getDescription={i => i.description || ''}
        />
      );
    case 'sequences':
      return (
        <SearchResult<Sequence>
          {...props}
          getTitle={i => i.name || `${i.id}`}
          getDescription={i => i.description || ''}
        />
      );

    default:
      return null;
  }
};
