import React, { useEffect, useState, useCallback } from 'react';
import { Button, Input } from '@cognite/cogs.js';
import { action } from '@storybook/addon-actions';
import { ResourceItem, ResourceType } from '../lib/types';
import {
  AssetTable,
  FilePreview,
  AssetPreview,
  SearchResults,
  FileTable,
  Splitter,
} from '../lib';
import {
  useAddResourceActions,
  useQuery,
  useResourcesState,
  ResourceItemState,
  useResourcePreview,
  ResourcePreviewProvider,
  useResourceMode,
  useSetOnSelectResource,
} from '../lib/context';
import { asset, file } from './stub';
import { Wrapper } from './utils';

export const ResourceLargePreviews = () => {
  return (
    <Splitter percentage secondaryMinSize={50}>
      <AssetPreview assetId={asset.id} />
      <FilePreview fileId={file.id} />
    </Splitter>
  );
};
ResourceLargePreviews.decorators = [
  Story => {
    return (
      <Wrapper>
        <Story />
      </Wrapper>
    );
  },
];

export const ResourcesLargeTables = () => {
  return (
    <Splitter percentage secondaryMinSize={50}>
      <AssetTable items={[asset]} onItemClicked={action('onItemClicked')} />
      <FileTable items={[file]} onItemClicked={action('onItemClicked')} />
    </Splitter>
  );
};
ResourcesLargeTables.decorators = [
  Story => {
    return (
      <Wrapper>
        <Story />
      </Wrapper>
    );
  },
];

export const ResourcesSearchResultsWithActions = ({
  currentResourceType,
}: Props) => {
  const [query, setQuery] = useQuery();
  const add = useAddResourceActions();
  const { setResourcesState } = useResourcesState();
  const { setMode } = useResourceMode();
  const setOnSelect = useSetOnSelectResource();

  const [resourceType, setResourceType] = useState<ResourceType>(
    currentResourceType
  );
  const [items, setItems] = useState<ResourceItemState[]>(
    [] as ResourceItemState[]
  );
  useEffect(() => {
    setResourceType(currentResourceType);
  }, [currentResourceType]);

  const onSelectCallback = useCallback((item: ResourceItem) => {
    setItems(currentItems => {
      const newItems = currentItems.filter(
        el => !(el.id === item.id && el.type === item.type)
      );
      if (newItems.length === currentItems.length) {
        return [
          ...newItems,
          { ...item, state: 'selected' } as ResourceItemState,
        ];
      }
      return newItems;
    });
    action('onSelect')(item);
  }, []);
  useEffect(() => {
    setOnSelect(() => onSelectCallback);
  }, [setOnSelect, onSelectCallback]);
  useEffect(() => {
    setMode('multiple');
  }, [setMode]);
  useEffect(() => {
    setResourcesState(items);
  }, [setResourcesState, items]);
  useEffect(() => {
    add('selector', item => (
      <Button onClick={() => action('onActionClicked')(item)}>
        Custom Action
      </Button>
    ));
  }, [add]);
  return (
    <>
      <Input value={query} onChange={ev => setQuery(ev.target.value)} />
      <SearchResults
        currentResourceType={resourceType}
        setCurrentResourceType={type => {
          setResourceType(type);
          action('setCurrentResourceType')(type);
        }}
      />
    </>
  );
};
type Props = {
  currentResourceType: ResourceType;
};
ResourcesSearchResultsWithActions.decorators = [
  Story => {
    return (
      <Wrapper>
        <Story />
      </Wrapper>
    );
  },
];
const Args: Props = {
  currentResourceType: 'asset',
};
ResourcesSearchResultsWithActions.args = Args;
const ArgType: {
  [key in keyof Props]?: any;
} = {
  currentResourceType: {
    control: {
      type: 'select',
      options: [
        'asset',
        'file',
        'timeSeries',
        'event',
        'sequence',
      ] as ResourceType[],
    },
  },
};
ResourcesSearchResultsWithActions.argTypes = ArgType;
ResourcesSearchResultsWithActions.decorators = [
  Story => {
    return (
      <Wrapper>
        <Story />
      </Wrapper>
    );
  },
];

const extraStyles: React.CSSProperties = {
  display: 'flex',
  height: '100%',
  width: '100%',
  flexDirection: 'column',
  background: 'grey',
};
export const NestingPreviews = () => {
  const Content = () => {
    const { openPreview } = useResourcePreview();
    return (
      <div>
        <Button
          onClick={() => {
            openPreview();
          }}
        >
          Open Preview
        </Button>
      </div>
    );
  };
  return (
    <div style={extraStyles}>
      <div style={{ height: '60px' }}>Header</div>
      <div style={{ flex: 1 }}>
        <ResourcePreviewProvider>
          <Content />
          <div
            style={{
              ...extraStyles,
              height: 300,
              background: 'lightgrey',
            }}
          >
            <div style={{ height: '60px' }}>Header 2</div>
            <div style={{ flex: 1 }}>
              <ResourcePreviewProvider>
                <Content />
              </ResourcePreviewProvider>
            </div>
          </div>
        </ResourcePreviewProvider>
      </div>
    </div>
  );
};
NestingPreviews.decorators = [
  Story => {
    return (
      <Wrapper>
        <Story />
      </Wrapper>
    );
  },
];
export default {
  title: 'Data Exploration Components',
  component: () => null,
  parameters: { docs: { source: { type: 'code' } } },
};
