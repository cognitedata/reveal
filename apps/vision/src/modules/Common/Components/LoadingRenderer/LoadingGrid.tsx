import React from 'react';

import styled from 'styled-components';

import { DEFAULT_PAGE_SIZE } from '@vision/constants/PaginationConsts';
import { GradientAnimateGridCell } from '@vision/modules/Common/Components/LoadingRenderer/GradientAnimateGridCell';
import { generateKeysArray } from '@vision/utils/generateKeysArray';

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
