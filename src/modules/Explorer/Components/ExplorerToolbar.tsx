/* eslint-disable @cognite/no-number-z-index */
import React from 'react';
import { Button, SegmentedControl, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { BulkActionMenu } from 'src/modules/Common/Components/BulkActionMenu/BulkActionMenu';
import { LoadingBar } from 'src/modules/Common/Components/LoadingBar/LoadingBar';
import { ExplorationSearchBar } from 'src/modules/Explorer/Components/ExplorationSearchBar';
import { ExplorerToolbarContainerProps } from 'src/modules/Explorer/Containers/ExplorerToolbarContainer';
import { useFlag } from '@cognite/react-feature-flags';

type ExplorerToolbarProps = ExplorerToolbarContainerProps & {
  maxSelectCount?: number;
  percentageScanned: number;
  onViewChange?: (view: string) => void;
  onSearch: (text: string) => void;
  onUpload: () => void;
  onDownload: () => void;
  onContextualise: () => void;
  onReview: () => void;
  onBulkEdit: () => void;
  onDelete: () => void;
  onTrainModel: () => void;
  onAutoMLModelPage: () => void;
  handleCancelOtherEdits: () => void;
};

export const ExplorerToolbar = ({
  query,
  selectedCount,
  maxSelectCount,
  isLoading,
  percentageScanned,
  currentView,
  onViewChange,
  onSearch,
  onUpload,
  onDownload,
  onContextualise,
  onReview,
  onBulkEdit,
  onDelete,
  onTrainModel,
  onAutoMLModelPage,
  reFetch,
  handleCancelOtherEdits,
}: ExplorerToolbarProps) => {
  const visionAutoMLEnabled = useFlag('VISION_AutoML', {
    fallback: false,
    forceRerender: true,
  });

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
            onTrainModel={onTrainModel}
            handleCancelOtherEdits={handleCancelOtherEdits}
          />
          {visionAutoMLEnabled && (
            <Button
              style={{ marginLeft: 14 }}
              icon="ArrowRight"
              type="tertiary"
              iconPlacement="right"
              onClick={onAutoMLModelPage}
            >
              AutoML Models
            </Button>
          )}
        </Right>
      </TitleBar>

      <Container>
        <Left>
          <ExplorationSearchBar searchString={query} onChange={onSearch} />
          <LoadingBar
            isLoading={isLoading}
            percentageScanned={percentageScanned}
            reFetch={reFetch}
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
            title="Gallery"
            size="small"
          >
            Gallery
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
