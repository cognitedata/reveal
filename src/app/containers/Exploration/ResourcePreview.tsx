import React from 'react';
import { AssetPreview } from 'app/containers/Asset/AssetPreview';
import { FilePreview } from 'app/containers/File/FilePreview';
import { SequencePreview } from 'app/containers/Sequence/SequencePreview';
import { TimeseriesPreview } from 'app/containers/Timeseries/TimeseriesPreview';
import { EventPreview } from 'app/containers/Event/EventPreview';
import { ResourceItem } from 'lib/types';
import { Button } from '@cognite/cogs.js';

type Props = {
  item: ResourceItem;
  onCloseClicked: () => void;
};
export default function ResourcePreview({
  item: { type, id },
  onCloseClicked,
}: Props) {
  const closePreviewButton = (
    <Button variant="outline" icon="Close" onClick={onCloseClicked}>
      Close preview
    </Button>
  );
  switch (type) {
    case 'asset':
      return <AssetPreview assetId={id} actions={closePreviewButton} />;
    case 'file':
      return <FilePreview fileId={id} actions={closePreviewButton} />;
    case 'sequence':
      return <SequencePreview sequenceId={id} actions={closePreviewButton} />;
    case 'timeSeries':
      return (
        <TimeseriesPreview timeseriesId={id} actions={closePreviewButton} />
      );
    case 'event':
      return <EventPreview eventId={id} actions={closePreviewButton} />;
    default:
      return <>{null}</>;
  }
}
