import React from 'react';
import { AssetPreview } from '@data-exploration-app/containers/Asset/AssetPreview';
import { FilePreview } from '@data-exploration-app/containers/File/FilePreview';
import { SequencePreview } from '@data-exploration-app/containers/Sequence/SequencePreview';
import { TimeseriesPreview } from '@data-exploration-app/containers/Timeseries/TimeseriesPreview';
import { EventPreview } from '@data-exploration-app/containers/Event/EventPreview';
import { ResourceItem } from '@cognite/data-exploration';

type Props = {
  item: ResourceItem;
};
export default function ResourcePreview({ item: { type, id } }: Props) {
  switch (type) {
    case 'asset':
      return <AssetPreview assetId={id} />;
    case 'file':
      return <FilePreview fileId={id} />;
    case 'sequence':
      return <SequencePreview sequenceId={id} />;
    case 'timeSeries':
      return <TimeseriesPreview timeseriesId={id} />;
    case 'event':
      return <EventPreview eventId={id} />;
    default:
      return null;
  }
}
