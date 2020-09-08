import React, { useState, useMemo } from 'react';
import { ResourceType } from 'types';
import { Tabs } from 'antd';
import { Title, Colors } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useDebounce } from 'use-debounce/lib';
import { useQuery } from 'context/ResourceSelectionContext';
import { SequenceFilterSearch } from './SequenceFilterSearch';
import { AssetFilterSearch } from './AssetFilterSearch';
import { FileFilterSearch } from './FileFilterSearch';
import { TimeseriesFilterSearch } from './TimeseriesFilterSearch';
import { EventFilterSearch } from './EventFilterSearch';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 16px;
  background: #fff;
  overflow: hidden;
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
  }
`;

const ResourceMap: { [key in ResourceType]: string } = {
  asset: 'Assets',
  file: 'Files',
  event: 'Events',
  timeSeries: 'Time Series',
  sequence: 'Sequences',
};

export const SearchResults = ({
  resourceTypes = ['asset', 'file', 'timeSeries', 'event', 'sequence'],
}: {
  resourceTypes?: ResourceType[];
}) => {
  const [activeKey, setActiveKey] = useState<ResourceType>('asset');
  const [query] = useQuery();
  const [debouncedQuery] = useDebounce(query, 100);

  const content = useMemo(() => {
    switch (activeKey) {
      case 'asset':
        return <AssetFilterSearch query={debouncedQuery} />;
      case 'file':
        return <FileFilterSearch query={debouncedQuery} />;
      case 'sequence':
        return <SequenceFilterSearch query={debouncedQuery} />;
      case 'timeSeries':
        return <TimeseriesFilterSearch query={debouncedQuery} />;
      case 'event':
        return <EventFilterSearch query={debouncedQuery} />;
      default:
        return null;
    }
  }, [activeKey, debouncedQuery]);

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
      <div className="content">{content}</div>
    </Wrapper>
  );
};
