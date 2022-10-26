import React from 'react';
import { AssetPreview } from 'app/containers/Asset/AssetPreview';
import { FilePreview } from 'app/containers/File/FilePreview';
import { SequencePreview } from 'app/containers/Sequence/SequencePreview';
import { TimeseriesPreview } from 'app/containers/Timeseries/TimeseriesPreview';
import { EventPreview } from 'app/containers/Event/EventPreview';
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
    case 'document': // At some point we might want to have documents its own preview
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
