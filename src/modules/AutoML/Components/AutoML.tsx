/* eslint-disable @cognite/no-number-z-index */
import { Divider } from '@cognite/data-exploration';
import React, { useState } from 'react';
import { StatusToolBar } from 'src/modules/Process/Containers/StatusToolBar';
import styled from 'styled-components';
import { AutoMLModelPage } from './AutoMLPage/AutoMLModelPage';
import { AutoMLModelList } from './AutoMLModelList';

const AutoML = () => {
  const [selectedModelId, setSelectedModelId] = useState<number>();

  const onRowClick = (id: number) => {
    setSelectedModelId(id);
  };
  return (
    <>
      <StatusToolBar current="Computer Vision Models" />
      <Container>
        <Left>
          <AutoMLModelList
            onRowClick={onRowClick}
            selectedModelId={selectedModelId}
          />
          <Divider.Vertical style={{ height: '100%', width: '1px' }} />
        </Left>
        <Right>
          <AutoMLModelPage selectedModelId={selectedModelId} />
        </Right>
      </Container>
    </>
  );
};

export default AutoML;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: calc(100% - 40px);
  background: #fff;
  overflow: hidden;
`;

const Left = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  grid-gap: 20px;
`;

const Right = styled.div`
  display: flex;
  justify-content: center;
  flex-grow: 1;
  padding: 10px;
`;
