import React from 'react';
import { ResourceType } from 'lib';
import { AssetPage } from 'app/containers/AssetPage';
import { FilePage } from 'app/containers/FilePage';
import { SequencePage } from 'app/containers/SequencePage';
import { TimeseriesPage } from 'app/containers/TimeseriesPage';
import { EventPage } from 'app/containers/EventPage';

type Props = {
  type: ResourceType;
};
export default function ResourcePreview({ type }: Props) {
  switch (type) {
    case 'asset':
      return <AssetPage />;
    case 'file':
      return <FilePage />;
    case 'sequence':
      return <SequencePage />;
    case 'timeSeries':
      return <TimeseriesPage />;
    case 'event':
      return <EventPage />;
    default:
      return <>{null}</>;
  }
}
