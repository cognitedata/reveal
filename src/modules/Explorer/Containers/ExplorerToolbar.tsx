/* eslint-disable @cognite/no-number-z-index */
import React from 'react';
import {
  Button,
  Detail,
  Dropdown,
  Icon,
  Menu,
  SegmentedControl,
  Title,
  Tooltip,
} from '@cognite/cogs.js';
import styled from 'styled-components';
import { ExplorationSearchBar } from './ExplorationSearchBar';

export const ExplorerToolbar = ({
  query,
  selectedCount,
  maxSelectCount,
  onViewChange,
  currentView,
  onSearch,
  onUpload,
  onDownload,
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
  onDownload: () => void;
  onContextualise: () => void;
  onReview: () => void;
}) => {
  const count = selectedCount ? `[${selectedCount}]` : null;
  const inLimit =
    selectedCount && maxSelectCount ? selectedCount <= maxSelectCount : true;
  const exceededLimitMessage = `Total number of files that can be processed simultaneously is ${maxSelectCount}`;
  const MenuContent = (
    <Menu
      style={{
        color: 'black' /* typpy styles make color to be white here ... */,
      }}
    >
      <Menu.Item
        onClick={onContextualise}
        disabled={!count || !inLimit}
        style={{ color: '#595959' }}
      >
        <Tooltip
          content={
            <span data-testid="text-content">{exceededLimitMessage}</span>
          }
          disabled={!!inLimit}
        >
          <>
            <Icon type="Scan" style={{ marginRight: 17 }} />
            <Detail strong>Contextualise {count}</Detail>
          </>
        </Tooltip>
      </Menu.Item>
      <Menu.Item
        onClick={onReview}
        disabled={!count}
        style={{ color: '#595959' }}
      >
        <Icon type="Edit" style={{ marginRight: 17 }} />
        <Detail strong>Review {count}</Detail>
      </Menu.Item>
      <Menu.Item
        onClick={onDownload}
        disabled={!count}
        style={{ color: '#595959' }}
      >
        <Icon type="Download" style={{ marginRight: 17 }} />
        <Detail strong>Download {count}</Detail>
      </Menu.Item>
    </Menu>
  );
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

          <Dropdown content={MenuContent}>
            <Button
              type="primary"
              icon="ChevronDownCompact"
              aria-label="dropdown button"
              disabled={!count}
              iconPlacement="right"
              style={{ marginLeft: 14 }}
            >
              Bulk actions {count}
            </Button>
          </Dropdown>
        </Right>
      </TitleBar>

      <Container>
        <ExplorationSearchBar searchString={query} onChange={onSearch} />

        <SegmentedControl
          onButtonClicked={onViewChange}
          currentKey={currentView}
          style={{ zIndex: 1 }}
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
`;
const Left = styled.div`
  align-self: center;
`;

const Right = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  z-index: 2;
`;

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: bottom;
  align-items: flex-end;
`;
