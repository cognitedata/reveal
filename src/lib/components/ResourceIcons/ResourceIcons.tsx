import React from 'react';
import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { ResourceType } from 'lib/types';

const IconWithBackground = styled(Icon)`
  padding: 8px;
  background-color: #edf0ff;
  color: #4255bb;
  border-radius: 4px;
`;

const AssetIcon = ({ style }: { style?: React.CSSProperties }) => (
  <IconWithBackground type="ResourceAssets" style={style} />
);
const TimeseriesIcon = ({ style }: { style?: React.CSSProperties }) => (
  <IconWithBackground type="ResourceTimeseries" style={style} />
);
const FileIcon = ({ style }: { style?: React.CSSProperties }) => (
  <IconWithBackground type="ResourceDocuments" style={style} />
);
const SequenceIcon = ({ style }: { style?: React.CSSProperties }) => (
  <IconWithBackground type="ResourceSequences" style={style} />
);
const EventIcon = ({ style }: { style?: React.CSSProperties }) => (
  <IconWithBackground type="ResourceEvents" style={style} />
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
    case 'sequence':
      return <SequenceIcon style={style} />;
    case 'event':
      return <EventIcon style={style} />;
    case 'asset':
      return <AssetIcon style={style} />;
    default:
      throw new Error('Invalid Type');
  }
};

ResourceIcons.Asset = AssetIcon;
ResourceIcons.Timeseries = TimeseriesIcon;
ResourceIcons.File = FileIcon;
ResourceIcons.Sequence = SequenceIcon;
ResourceIcons.Event = EventIcon;
