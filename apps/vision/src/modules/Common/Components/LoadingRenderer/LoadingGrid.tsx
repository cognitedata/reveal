import React from 'react';

import styled from 'styled-components';

import { DEFAULT_PAGE_SIZE } from '../../../../constants/PaginationConsts';
import { generateKeysArray } from '../../../../utils/generateKeysArray';

import { GradientAnimateGridCell } from './GradientAnimateGridCell';

export const LoadingGrid = () => {
  const itemKeys = generateKeysArray(DEFAULT_PAGE_SIZE);
  return (
    <Container>
      {itemKeys.map((key) => (
        <GradientAnimateGridCell key={key} />
      ))}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  overflow-y: hidden;
`;
