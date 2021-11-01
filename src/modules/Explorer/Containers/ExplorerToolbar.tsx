/* eslint-disable @cognite/no-number-z-index */
import React from 'react';
import { Button, SegmentedControl, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { BulkActionMenu } from 'src/modules/Common/Components/BulkActionMenu/BulkActionMenu';
import { LoadingBar } from 'src/modules/Common/Components/LoadingBar/LoadingBar';
import { ExplorationSearchBar } from './ExplorationSearchBar';

export const ExplorerToolbar = ({
  query,
  selectedCount,
  maxSelectCount,
  isLoading,
  percentageScanned,
  onViewChange,
  currentView,
  onSearch,
  onUpload,
  onDownload,
  onContextualise,
  onReview,
  onBulkEdit,
  onDelete,
}: {
  query?: string;
  selectedCount?: number;
  maxSelectCount?: number;
  isLoading: boolean;
  percentageScanned: number;
  onViewChange?: (view: string) => void;
  currentView?: string;
  onSearch: (text: string) => void;
  onUpload: () => void;
  onDownload: () => void;
  onContextualise: () => void;
  onReview: () => void;
  onBulkEdit: () => void;
  onDelete: () => void;
}) => {
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
          <BulkActionMenu
            selectedCount={selectedCount}
            maxSelectCount={maxSelectCount}
            onDownload={onDownload}
            onContextualise={onContextualise}
            onReview={onReview}
            onBulkEdit={onBulkEdit}
            onDelete={onDelete}
          />
        </Right>
      </TitleBar>

      <Container>
        <Left>
          <ExplorationSearchBar searchString={query} onChange={onSearch} />
          <LoadingBar
            isLoading={isLoading}
            percentageScanned={percentageScanned}
          />
        </Left>
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
  display: grid;
  grid-template-columns: auto auto;
  grid-gap: 20px;
  align-self: center;
  align-items: center;
  z-index: 2;
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
  align-items: flex-end;
`;
