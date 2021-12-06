import React from 'react';
import styled from 'styled-components';
import { useCurrentResourceType } from 'app/hooks';
import { AssetPage } from 'app/containers/Asset/AssetPage';
import { EventPage } from 'app/containers/Event/EventPage';
import { TimeseriesPage } from 'app/containers/Timeseries/TimeseriesPage';
import { FilePage } from 'app/containers/File/FilePage';
import { SequencePage } from 'app/containers/Sequence/SequencePage';
import { ThreeDPreview } from 'app/containers/ThreeD/ThreeDPreview';

export const ResourceDetailsPage = () => {
  const [currentResourceType] = useCurrentResourceType();

  const ResourcePage = () => {
    switch (currentResourceType) {
      case 'asset':
        return <AssetPage />;
      case 'event':
        return <EventPage />;
      case 'timeSeries':
        return <TimeseriesPage />;
      case 'file':
        return <FilePage />;
      case 'sequence':
        return <SequencePage />;
      case 'threeD':
        return <ThreeDPreview />;
      default:
        return null;
    }
  };

  return <Wrapper>{ResourcePage()}</Wrapper>;
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #fff;
  overflow: hidden;
`;
