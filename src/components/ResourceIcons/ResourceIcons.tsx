import React from 'react';
import { Label } from '@cognite/cogs.js';
import { ResourceType } from 'types';

const AssetIcon = ({ style }: { style?: React.CSSProperties }) => (
  <Label variant="normal" icon="Assets" style={style} />
);
const TimeseriesIcon = ({ style }: { style?: React.CSSProperties }) => (
  <Label variant="normal" icon="Timeseries" style={style} />
);
const FileIcon = ({ style }: { style?: React.CSSProperties }) => (
  <Label variant="normal" icon="Document" style={style} />
);
const DocumentIcon = ({ style }: { style?: React.CSSProperties }) => (
  <Label variant="normal" icon="Document" style={style} />
);
const SequenceIcon = ({ style }: { style?: React.CSSProperties }) => (
  <Label variant="normal" icon="Sequences" style={style} />
);
const EventIcon = ({ style }: { style?: React.CSSProperties }) => (
  <Label variant="normal" icon="Events" style={style} />
);
const ThreeDIcon = ({ style }: { style?: React.CSSProperties }) => (
  <Label variant="normal" icon="Cube" style={style} />
);

export const ResourceIcons = ({
  type,
  style,
}: {
  type: ResourceType;
  style?: React.CSSProperties;
}) => {
  switch (type) {
    case 'timeSeries':
      return <TimeseriesIcon style={style} />;
    case 'file':
      return <FileIcon style={style} />;
    case 'document':
      return <DocumentIcon style={style} />;
    case 'sequence':
      return <SequenceIcon style={style} />;
    case 'event':
      return <EventIcon style={style} />;
    case 'asset':
      return <AssetIcon style={style} />;
    case 'threeD':
      return <ThreeDIcon style={style} />;
    default:
      throw new Error('Invalid Type');
  }
};

ResourceIcons.Asset = AssetIcon;
ResourceIcons.Timeseries = TimeseriesIcon;
ResourceIcons.File = FileIcon;
ResourceIcons.Document = DocumentIcon;
ResourceIcons.Sequence = SequenceIcon;
ResourceIcons.Event = EventIcon;
