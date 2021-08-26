// haven't finished yet
import { Body, Button, Input } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

export const MetadataPanel = () => (
  <PanelContainer>
    <SelectContainer>
      <Body level={2}>Select data to edit</Body>
      {/* <Select value={value2} onChange={setValue2} options={colorOptions} /> */}
    </SelectContainer>
    <InputContainer>
      <Body level={2}>Select data to edit</Body>
      <Input
      // value={value2}
      // onChange={setValue2}
      // options={colorOptions}
      />
    </InputContainer>
    <Button
      type="secondary"
      onClick={() => {
        console.error('Not Implemented');
      }}
    >
      Update
    </Button>
    <Button
      type="tertiary"
      onClick={() => {
        console.error('Not Implemented');
      }}
    >
      New
    </Button>
  </PanelContainer>
);

const PanelContainer = styled.div`
  display: grid;
  grid-auto-flow: column;
  justify-content: left;
  align-items: end;
  grid-gap: 8px;
`;
const SelectContainer = styled.div`
  display: grid;
  grid-gap: 6px;
  width: 255px;
`;
const InputContainer = styled.div`
  display: grid;
  grid-gap: 6px;
  width: 237px;
`;
