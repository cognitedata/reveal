import React from 'react';
import { AssetPreview } from 'app/containers/Asset/AssetPreview';
import { FilePreview } from 'app/containers/File/FilePreview';
import { SequencePreview } from 'app/containers/Sequence/SequencePreview';
import { TimeseriesPreview } from 'app/containers/Timeseries/TimeseriesPreview';
import { EventPreview } from 'app/containers/Event/EventPreview';
import { ThreeDPreview } from 'app/containers/ThreeD/ThreeDPreview';
import { ResourceItem } from '@cognite/data-exploration';
import { Button } from '@cognite/cogs.js';
import { Tooltip } from 'antd';

type Props = {
  item: ResourceItem;
  onCloseClicked: () => void;
};
export default function ResourcePreview({
  item: { type, id },
  onCloseClicked,
}: Props) {
  const closePreviewButton = (
    <Tooltip title="Close preview">
      <Button icon="Close" onClick={onCloseClicked} />
    </Tooltip>
  );
  switch (type) {
    case 'asset':
      return <AssetPreview assetId={id} actions={closePreviewButton} />;
    case 'file':
      return <FilePreview fileId={id} actions={closePreviewButton} />;
    case 'document': // At some point we might want to have documents its own preview
      return <FilePreview fileId={id} actions={closePreviewButton} />;
    case 'sequence':
      return <SequencePreview sequenceId={id} actions={closePreviewButton} />;
    case 'timeSeries':
      return (
        <TimeseriesPreview timeseriesId={id} actions={closePreviewButton} />
      );
    case 'event':
      return <EventPreview eventId={id} actions={closePreviewButton} />;
    case 'threeD':
      return <ThreeDPreview threeDId={id} actions={closePreviewButton} />;
    default:
      return null;
  }
}
