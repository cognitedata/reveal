import React from 'react';
import { SegmentedControl, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { ExplorationSearchBar } from './ExplorationSearchBar';

export const ExplorerToolbar = ({
  query,
  onViewChange,
  currentView = 'list',
  onSearch,
}: {
  query?: string;
  onViewChange?: (view: string) => void;
  currentView?: string;
  onSearch: (text: string) => void;
}) => {
  return (
    <>
      <Title level={4} style={{ paddingTop: '10px' }}>
        {/* TODO: add counter */}
        All files
      </Title>
      <Container>
        <ExplorationSearchBar searchString={query} onChange={onSearch} />

        <SegmentedControl
          onButtonClicked={onViewChange}
          currentKey={currentView}
        >
          <SegmentedControl.Button
            key="list"
            icon="List"
            title="List"
            size="small"
          >
            List
          </SegmentedControl.Button>
          <SegmentedControl.Button
            key="grid"
            icon="Grid"
            title="Grid"
            size="small"
          >
            Grid
          </SegmentedControl.Button>

          <SegmentedControl.Button
            key="map"
            icon="Map"
            title="Map"
            size="small"
          >
            Map
          </SegmentedControl.Button>
        </SegmentedControl>
      </Container>
    </>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: bottom;
  padding: 15px 0;
  align-items: flex-end;
`;
