import React from 'react';
import { List } from 'antd';
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
import { useResourceResults } from 'lib';

type ResourceType = FileInfo | Asset | CogniteEvent | Sequence | Timeseries;

export const SearchResultListItem = <T extends ResourceType>({
  item,
  getTitle,
  getDescription,
  onRowClick,
  style,
}: {
  item: T;
  getTitle: (i: T) => string;
  getDescription: (i: T) => string;
  onRowClick: (id: number) => void;
  style?: any;
}) => {
  return (
    <List.Item key={item.id} onClick={() => onRowClick(item.id)} style={style}>
      <div>
        <div>
          <h4>{getTitle(item)}</h4>
        </div>
        <div>
          <p>{getDescription(item)}</p>
        </div>
      </div>
    </List.Item>
  );
};

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
          <SearchResultListItem
            item={item}
            getTitle={getTitle}
            getDescription={getDescription}
            onRowClick={onRowClick}
            style={
              item.id === currentId
                ? {
                    backgroundColor: Colors['greyscale-grey1'].hex(),
                    cursor: 'pointer',
                  }
                : { cursor: 'pointer' }
            }
          />
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
