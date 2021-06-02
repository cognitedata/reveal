import React from 'react';
import { Button, SegmentedControl, Title, Tooltip } from '@cognite/cogs.js';
import styled from 'styled-components';
import { ExplorationSearchBar } from './ExplorationSearchBar';

export const ExplorerToolbar = ({
  query,
  selectedCount,
  maxSelectCount,
  onViewChange,
  currentView = 'list',
  onSearch,
  onUpload,
  onContextualise,
  onReview,
}: {
  query?: string;
  selectedCount?: number;
  maxSelectCount?: number;
  onViewChange?: (view: string) => void;
  currentView?: string;
  onSearch: (text: string) => void;
  onUpload: () => void;
  onContextualise: () => void;
  onReview: () => void;
}) => {
  const count = selectedCount ? `[${selectedCount}]` : null;
  const inLimit =
    selectedCount && maxSelectCount ? selectedCount <= maxSelectCount : true;
  const exceededLimitMessage = `Total number of files that can be processed simultaneously is ${maxSelectCount}`;

  return (
    <>
      <TitleBar>
        <Left>
          <Title level={2}>Vision Explore</Title>
        </Left>
        <Right>
          <Button
            style={{ marginLeft: 14 }}
            icon="Upload"
            type="tertiary"
            onClick={onUpload}
          >
            Upload
          </Button>

          <Tooltip
            content={
              <span data-testid="text-content">{exceededLimitMessage}</span>
            }
            disabled={!!inLimit}
          >
            <Button
              style={{ marginLeft: 14 }}
              icon="ExpandMax"
              type="primary"
              onClick={onContextualise}
              disabled={!count || !inLimit}
            >
              Contextualise {count}
            </Button>
          </Tooltip>

          <Button
            style={{ marginLeft: 14 }}
            icon="Edit"
            type="primary"
            onClick={onReview}
            disabled={!count}
          >
            Review {count}
          </Button>
        </Right>
      </TitleBar>

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

const TitleBar = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  margin: 20px 0px 0px 0px;
`;
const Left = styled.div`
  align-self: center;
`;

const Right = styled.div`
  justify-self: end;
  align-self: center;
  grid-gap: 14px;
`;

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: bottom;
  padding: 15px 0;
  align-items: flex-end;
`;
