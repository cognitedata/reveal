import React from 'react';
import styled from 'styled-components';
import { GradientAnimateGridCell } from 'src/modules/Common/Components/LoadingRenderer/GradientAnimateGridCell';
import { DEFAULT_PAGE_SIZE } from 'src/constants/PaginationConsts';
import { generateKeysArray } from 'src/utils/generateKeysArray';

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
