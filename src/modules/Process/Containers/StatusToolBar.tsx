import { Body } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';
import { CDFStatus } from 'src/modules/Common/Components/CDFStatus/CDFStatus';

export const StatusToolBar = () => {
  return (
    <Container>
      <Text level={3}>CDF Contextualize Imagery Data</Text>
      <CDFStatus />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  border: 1px solid #dcdcdc;
  padding: 0 12px;
`;

const Text = styled(Body)`
  color: #8c8c8c;
  margin-left: 8px;
`;
