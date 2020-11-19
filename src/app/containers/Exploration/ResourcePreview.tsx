import React from 'react';
import { Button } from 'antd';
import { AssetPreview } from 'app/containers/Asset/AssetPreview';
import { FilePreview } from 'app/containers/File/FilePreview';
import { SequencePreview } from 'app/containers/Sequence/SequencePreview';
import { TimeseriesPreview } from 'app/containers/Timeseries/TimeseriesPreview';
import { EventPreview } from 'app/containers/Event/EventPreview';
import { ResourceItem } from 'lib/types';
import { TitleRowActionsProps } from 'app/components/TitleRowActions';
import { Icon } from '@cognite/cogs.js';

type Props = {
  item: ResourceItem;
  onCloseClicked: () => void;
};
export default function ResourcePreview({
  item: { type, id },
  onCloseClicked,
}: Props) {
  const actions: TitleRowActionsProps['actions'] = [
    'Download',
    'Collections',
    'Copy',
    'Open',
    () => (
      <Button
        type="ghost"
        icon={<Icon type="Close" />}
        onClick={onCloseClicked}
      />
    ),
  ];
  switch (type) {
    case 'asset':
      return <AssetPreview assetId={id} actions={actions} />;
    case 'file':
      return <FilePreview fileId={id} actions={actions} />;
    case 'sequence':
      return <SequencePreview sequenceId={id} actions={actions} />;
    case 'timeSeries':
      return <TimeseriesPreview timeseriesId={id} actions={actions} />;
    case 'event':
      return <EventPreview eventId={id} actions={actions} />;
    default:
      return <>{null}</>;
  }
}
