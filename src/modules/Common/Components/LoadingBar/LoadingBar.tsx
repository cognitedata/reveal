import React from 'react';
import styled from 'styled-components';
import { Body, Button } from '@cognite/cogs.js';
import { Spin } from 'antd';
import LoadingOutlined from '@ant-design/icons/lib/icons/LoadingOutlined';
import { cancelFetch } from 'src/api/file/fetchFiles/fetchFiles';

const antIcon = <LoadingOutlined style={{ fontSize: 14 }} spin />;

export const LoadingBar = ({
  isLoading,
  percentageScanned,
}: {
  isLoading: boolean;
  percentageScanned: number;
}) => {
  return isLoading ? (
    <Container>
      <LoadingText level={2}>
        {Math.ceil(percentageScanned)}% results loaded{' '}
      </LoadingText>
      <Spin indicator={antIcon} style={{ alignSelf: 'center' }} />
      <Button onClick={() => cancelFetch()} type="ghost-danger">
        Stop
      </Button>
    </Container>
  ) : null;
};

const Container = styled.div`
  display: flex;
  gap: 10px;
`;
const LoadingText = styled(Body)`
  color: #4255bb;
  align-self: center;
`;
