import React from 'react';
import { Button, SegmentedControl, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { getLink, workflowRoutes } from 'src/modules/Workflow/workflowRoutes';
import { useHistory } from 'react-router-dom';
import { ExplorationSearchBar } from './ExplorationSearchBar';
import { setExplorerFileUploadModalVisibility } from '../store/explorerSlice';

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
  const dispatch = useDispatch();
  const history = useHistory();

  return (
    <>
      <TitleBar>
        <Left>
          <Title level={2}>
            {/* TODO: add counter */}
            Vision Explore
          </Title>
        </Left>
        <Right>
          <Button
            style={{ marginLeft: 14 }}
            icon="Upload"
            type="tertiary"
            onClick={() => dispatch(setExplorerFileUploadModalVisibility(true))}
          >
            Upload files
          </Button>
          {/* ToDo(VIS-188)   */}
          <Button
            style={{ marginLeft: 14 }}
            icon="ExpandMax"
            type="tertiary"
            onClick={() => history.push(getLink(workflowRoutes.process))}
          >
            Contextualise selected
          </Button>
          <Button
            style={{ marginLeft: 14 }}
            icon="Edit"
            type="tertiary"
            onClick={() => {}}
            disabled
          >
            Review selected
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
