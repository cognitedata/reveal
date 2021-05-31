import { Body, Icon } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

export const StatusToolBar = () => {
  return (
    <Container>
      <Text level={3}>CDF Contextualize Imagery Data</Text>
      <Status>
        <Icon type="Checkmark" />
        {/* <Text level={3}>Saved 8.45 to CDF</Text> */}
      </Status>
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
const Status = styled.div`
  display: flex;
  color: #8c8c8c;
`;

const Text = styled(Body)`
  color: #8c8c8c;
  margin-left: 8px;
`;
