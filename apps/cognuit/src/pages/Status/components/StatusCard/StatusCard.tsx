import { HeartbeatsConnector } from 'pages/Status/types';
import React from 'react';
import { useHeartbeatsReportQuery } from 'services/endpoints/sources/query';
import styled from 'styled-components';
import LoadingBox from 'components/Molecules/LoadingBox';
import { Body, Flex } from '@cognite/cogs.js';

import { StatusBar } from './Bar';
import { StatusHeader } from './Header';

const Container = styled.div`
  width: 512px;
  border: 2px solid var(--cogs-greyscale-grey2);
  background-color: var(--cogs-greyscale-grey1);
  border-radius: 12px;
  padding: 15px;
`;

export const StatusCard: React.FC<HeartbeatsConnector> = ({
  source,
  instance,
}) => {
  const { data, isLoading, isError } = useHeartbeatsReportQuery({
    source,
    instance,
  });

  const renderContent = () => {
    if (isLoading) {
      return <LoadingBox backgroundColor="transparent" textColor="black" />;
    }

    if (data?.aggregates) {
      return <StatusBar aggregates={data.aggregates} />;
    }

    return (
      <Flex justifyContent="center">
        <Body level={2}>Instance not found</Body>
      </Flex>
    );
  };

  return (
    <Container>
      <StatusHeader
        source={source}
        instance={instance}
        online={data?.online}
        loading={isLoading}
        error={isError}
      />
      {renderContent()}
    </Container>
  );
};
