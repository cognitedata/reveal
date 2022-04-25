import React from 'react';
import styled from 'styled-components';
import { useCurrentResourceType } from 'app/hooks';
import { AssetPage } from 'app/containers/Asset/AssetPage';
import { EventPage } from 'app/containers/Event/EventPage';
import { TimeseriesPage } from 'app/containers/Timeseries/TimeseriesPage';
import { FilePage } from 'app/containers/File/FilePage';
import { SequencePage } from 'app/containers/Sequence/SequencePage';
import { ThreeDPreview } from 'app/containers/ThreeD/ThreeDPreview';

const resourcePageType = {
  asset: AssetPage,
  event: EventPage,
  timeSeries: TimeseriesPage,
  file: FilePage,
  sequence: SequencePage,
  threeD: ThreeDPreview,
};

export const ResourceDetailsPage = () => {
  const [currentResourceType] = useCurrentResourceType();
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
