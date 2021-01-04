import React from 'react';
import styled from 'styled-components';
import { useCurrentResourceType } from 'app/hooks';
import { AssetPage } from 'app/containers/Asset/AssetPage';
import { EventPage } from 'app/containers/Event/EventPage';
import { TimeseriesPage } from 'app/containers/Timeseries/TimeseriesPage';
import { FilePage } from 'app/containers/File/FilePage';
import { SequencePage } from 'app/containers/Sequence/SequencePage';
import { ResourceTypeTabs } from 'lib';

export const ResourceDetailsPage = () => {
  const [
    currentResourceType,
    setCurrentResourceType,
  ] = useCurrentResourceType();

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
      default:
        return null;
    }
  };

  return (
    <>
      <ResourceTypeTabs
        currentResourceType={currentResourceType}
        setCurrentResourceType={setCurrentResourceType}
      />
      <Wrapper>{ResourcePage()}</Wrapper>
    </>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100% - 56px);
  background: #fff;
  overflow: hidden;
`;
