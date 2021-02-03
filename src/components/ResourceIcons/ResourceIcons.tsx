import React from 'react';
import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { ResourceType } from 'types';

const IconBackground = styled.div`
  padding: 8px;
  background-color: #edf0ff;
  color: #4255bb;
  border-radius: 4px;
  height: 32px;
`;

const AssetIcon = ({ style }: { style?: React.CSSProperties }) => (
  <IconBackground style={style}>
    <Icon type="ResourceAssets" />
  </IconBackground>
);
const TimeseriesIcon = ({ style }: { style?: React.CSSProperties }) => (
  <IconBackground style={style}>
    <Icon type="ResourceTimeseries" />
  </IconBackground>
);
const FileIcon = ({ style }: { style?: React.CSSProperties }) => (
  <IconBackground style={style}>
    <Icon type="ResourceDocuments" />
  </IconBackground>
);
const SequenceIcon = ({ style }: { style?: React.CSSProperties }) => (
  <IconBackground style={style}>
    <Icon type="ResourceSequences" />
  </IconBackground>
);
const EventIcon = ({ style }: { style?: React.CSSProperties }) => (
  <IconBackground style={style}>
    <Icon type="ResourceEvents" />
  </IconBackground>
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
