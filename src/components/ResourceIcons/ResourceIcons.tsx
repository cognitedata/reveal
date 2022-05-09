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
    <Icon type="Assets" style={{ marginRight: 0 }} />
  </IconBackground>
);
const TimeseriesIcon = ({ style }: { style?: React.CSSProperties }) => (
  <IconBackground style={style}>
    <Icon type="Timeseries" style={{ marginRight: 0 }} />
  </IconBackground>
);
const FileIcon = ({ style }: { style?: React.CSSProperties }) => (
  <IconBackground style={style}>
    <Icon type="Document" style={{ marginRight: 0 }} />
  </IconBackground>
);
const SequenceIcon = ({ style }: { style?: React.CSSProperties }) => (
  <IconBackground style={style}>
    <Icon type="Sequences" style={{ marginRight: 0 }} />
  </IconBackground>
);
const EventIcon = ({ style }: { style?: React.CSSProperties }) => (
  <IconBackground style={style}>
    <Icon type="Events" style={{ marginRight: 0 }} />
  </IconBackground>
);
const ThreeDIcon = ({ style }: { style?: React.CSSProperties }) => (
  <IconBackground style={style}>
    <Icon type="Cube" style={{ marginRight: 0 }} />
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
    case 'threeD':
      return <ThreeDIcon style={style} />;
    default:
      throw new Error('Invalid Type');
  }
};

ResourceIcons.Asset = AssetIcon;
ResourceIcons.Timeseries = TimeseriesIcon;
ResourceIcons.File = FileIcon;
ResourceIcons.Sequence = SequenceIcon;
ResourceIcons.Event = EventIcon;
