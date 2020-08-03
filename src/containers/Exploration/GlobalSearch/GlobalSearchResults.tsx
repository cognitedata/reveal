import React, { useState, useEffect } from 'react';
import { ResourceType } from 'modules/sdk-builder/types';
import { Tabs } from 'antd';
import { Title, Colors } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useDebounce } from 'use-debounce/lib';
import { RenderResourceActionsFunction } from 'containers/HoverPreview';
import { AssetFilterSearch } from './AssetFilterSearch';
import { FileFilterSearch } from './FileFilterSearch';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
`;

const ResourceMap: { [key in ResourceType]: string } = {
  assets: 'Assets',
  files: 'Files',
  events: 'Events',
  timeseries: 'Time Series',
  sequences: 'Sequences',
};

export const GlobalSearchResults = ({
  resourceTypes = ['assets', 'files'],
  query: queryFromProps,
  renderResourceActions,
  currentResourceId,
  currentResourceType,
}: {
  resourceTypes?: ResourceType[];
  query?: string;
  renderResourceActions?: RenderResourceActionsFunction;
  currentResourceId?: number;
  currentResourceType?: ResourceType;
}) => {
  const [activeKey, setActiveKey] = useState<ResourceType>('assets');
  const [query, setQuery] = useState(queryFromProps);
  const [debouncedQuery] = useDebounce(query, 100);

  useEffect(() => {
    setQuery(queryFromProps);
  }, [queryFromProps]);

  return (
    <Wrapper>
      <Tabs
        activeKey={activeKey}
        onChange={el => setActiveKey(el as ResourceType)}
      >
        {resourceTypes.map(el => (
          <Tabs.TabPane
            key={el}
            style={{ padding: 0 }}
            tab={
              <Title
                level={3}
                style={{
                  color:
                    activeKey === el
                      ? Colors.black.hex()
                      : Colors['greyscale-grey6'].hex(),
                  cursor: 'pointer',
                }}
              >
                {ResourceMap[el]}
              </Title>
            }
          />
        ))}
      </Tabs>
      <div className="content">
        {(() => {
          switch (activeKey) {
            case 'assets':
              return (
                <AssetFilterSearch
                  query={debouncedQuery}
                  activeIds={
                    currentResourceType === 'assets' && !!currentResourceId
                      ? [currentResourceId]
                      : undefined
                  }
                  renderResourceActions={renderResourceActions}
                />
              );
            case 'files':
              return (
                <FileFilterSearch
                  query={debouncedQuery}
                  activeIds={
                    currentResourceType === 'files' && !!currentResourceId
                      ? [currentResourceId]
                      : undefined
                  }
                  renderResourceActions={renderResourceActions}
                />
              );
            default:
              return null;
          }
        })()}
      </div>
    </Wrapper>
  );
};
