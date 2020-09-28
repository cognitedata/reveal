import React from 'react';
import { Graphic, Colors } from '@cognite/cogs.js';
import styled from 'styled-components';
import LoadingBox from '../LoadingBox';

type Props = {
  isLoading?: boolean;
  text: string;
};

const Container = styled.div``;
const NoData = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--cogs-black);
  padding: 1.5rem;
`;

const EmptyTableMessage = ({ isLoading, text }: Props) => {
  const renderNoData = (
    <NoData>
      <Graphic type="Search" />
      {text}
    </NoData>
  );
  return (
    <Container>
      {isLoading ? (
        <LoadingBox
          text="Loading..."
          backgroundColor={Colors.white.hex()}
          textColor={Colors.black.hex()}
        />
      ) : (
        renderNoData
      )}
    </Container>
  );
};

export default EmptyTableMessage;
