import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Body, Button } from '@cognite/cogs.js';
import { Spin } from 'antd';
import LoadingOutlined from '@ant-design/icons/lib/icons/LoadingOutlined';
import { cancelFetch } from 'src/api/file/fetchFiles/fetchFiles';

const antIcon = <LoadingOutlined style={{ fontSize: 14 }} spin />;

export const LoadingBar = ({
  isLoading,
  percentageScanned,
  reFetch,
}: {
  isLoading: boolean;
  percentageScanned: number;
  reFetch: () => void;
}) => {
  const [fetchingInterrupted, setFetchingInterrupted] = useState(false);
  const onStop = () => {
    setFetchingInterrupted(true);
    cancelFetch();
  };
  const onRefetch = () => {
    setFetchingInterrupted(false);
    reFetch();
  };

  useEffect(() => {
    if (isLoading && fetchingInterrupted) {
      setFetchingInterrupted(false);
    }
  }, [isLoading, percentageScanned]);

  if (isLoading) {
    return (
      <Container>
        <LoadingText level={2}>
          {Math.ceil(percentageScanned)}% of files scanned{' '}
        </LoadingText>
        <Spin indicator={antIcon} style={{ alignSelf: 'center' }} />
        <Button onClick={onStop} type="ghost-danger">
          Stop
        </Button>
      </Container>
    );
  }
  if (fetchingInterrupted) {
    return (
      <Container>
        <LoadingText level={2}>
          {Math.ceil(percentageScanned)}% of files scanned{' '}
        </LoadingText>
        <Button onClick={onRefetch} type="ghost">
          Re-Fetch
        </Button>
      </Container>
    );
  }
  return null;
};

const Container = styled.div`
  display: flex;
  gap: 10px;
`;
const LoadingText = styled(Body)`
  color: #4255bb;
  align-self: center;
`;
