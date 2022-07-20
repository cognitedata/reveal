import React from 'react';

import times from 'lodash/times';
import styled from 'styled-components/macro';

import { DragDropContainer } from 'components/DragDropContainer';

const Item = styled.div`
  width: 200px;
  border: 1px solid grey;
  margin-bottom: 10px;
  background-color: lightblue;
  padding: 10px;
`;

const StickChart: React.FC = () => {
  return (
    <DragDropContainer id="list">
      {times(5).map((index) => (
        <Item key={index}>Item {index}</Item>
      ))}
    </DragDropContainer>
  );
};

export default StickChart;
