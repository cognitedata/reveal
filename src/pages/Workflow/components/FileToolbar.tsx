import React from 'react';
import { Checkbox, Button, ButtonGroup, Detail } from '@cognite/cogs.js';
import { DetectionModelSelect } from 'src/pages/Workflow/process/DetectionModelSelect';
import styled from 'styled-components';

export const FileToolbar = ({
  onViewChange,
  currentView = 'list',
  value,
  onChange,
}: {
  onViewChange?: (view: string) => void;
  currentView?: string;
  value?: any;
  onChange?: any;
}) => {
  return (
    <>
      <Container>
        <CheckboxContainer>
          <Checkbox name="select-all">Select all</Checkbox>
        </CheckboxContainer>

        <ModelSelector>
          <Detail strong>ML model</Detail>
          <DetectionModelSelect value={value} onChange={onChange} />
        </ModelSelector>

        <DeleteContainer>
          <Button type="secondary" icon="Delete">
            Delete
          </Button>
        </DeleteContainer>

        <ButtonGroup onButtonClicked={onViewChange} currentKey={currentView}>
          <ButtonGroup.Button key="list" icon="List" title="List" size="small">
            List
          </ButtonGroup.Button>
          <ButtonGroup.Button key="grid" icon="Grid" title="Grid" size="small">
            Grid
          </ButtonGroup.Button>
        </ButtonGroup>
      </Container>
      <HorizontalLine hidden={currentView === 'list'} />
    </>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: bottom;
  padding: 15px 0;
  align-items: flex-end;
`;

const CheckboxContainer = styled.div`
  margin-right: auto;
`;

const ModelSelector = styled.div`
  padding-right: 15px;
  max-width: 340px;
  width: 340px;
`;

const DeleteContainer = styled.div`
  padding-right: 15px;
`;

const HorizontalLine = styled.div`
  border: 1px solid #e8e8e8;
  visibility: ${(props) => (props.hidden ? 'hidden' : 'visible')};
`;
