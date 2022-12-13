import React from 'react';
import styled from 'styled-components';
import { useCurrentResourceType } from '@data-exploration-app/hooks/hooks';
import { AssetPage } from '@data-exploration-app/containers/Asset/AssetPage';
import { EventPage } from '@data-exploration-app/containers/Event/EventPage';
import { TimeseriesPage } from '@data-exploration-app/containers/Timeseries/TimeseriesPage';
import { FilePage } from '@data-exploration-app/containers/File/FilePage';
import { SequencePage } from '@data-exploration-app/containers/Sequence/SequencePage';
import { ThreeDPage } from '@data-exploration-app/containers/ThreeD/ThreeDPage';
import { DocumentPage } from '@data-exploration-app/containers/Document/DocumentPage';

const resourcePageType = {
  asset: AssetPage,
  event: EventPage,
  timeSeries: TimeseriesPage,
  file: FilePage,
  sequence: SequencePage,
  threeD: ThreeDPage,
  document: DocumentPage,
};

export const ResourceDetailsPage = () => {
  const [currentResourceType] = useCurrentResourceType();
  if (!currentResourceType) {
    return null;
  }

  const ResourcePage = resourcePageType[currentResourceType];

  return (
    <Wrapper>
      <ResourcePage />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #fff;
`;
