import React from 'react';
import { Icon } from '@cognite/cogs.js';
import styled, { css } from 'styled-components';
import { ResourceType } from 'lib/types';

const IconWithBackground = styled(Icon)<{
  $backgroundColor: string;
  $color: string;
}>(
  props => css`
    padding: 8px;
    background-color: ${props.$backgroundColor};
    color: ${props.$color};
    border-radius: 4px;
  `
);

const AssetIcon = ({ style }: { style?: React.CSSProperties }) => (
  <IconWithBackground
    type="DataStudio"
    $color="#8D1E47"
    $backgroundColor="#FDCED6"
    style={style}
  />
);
const TimeseriesIcon = ({ style }: { style?: React.CSSProperties }) => (
  <IconWithBackground
    type="Timeseries"
    $color="#642175"
    $backgroundColor="#F4DAF8"
    style={style}
  />
);
const FileIcon = ({ style }: { style?: React.CSSProperties }) => (
  <IconWithBackground
    type="Document"
    $color="#D27200"
    $backgroundColor="#FFF1CC"
    style={style}
  />
);
const SequenceIcon = ({ style }: { style?: React.CSSProperties }) => (
  <IconWithBackground
    type="Duplicate"
    $color="#CC512B"
    $backgroundColor="#FFE1D1"
    style={style}
  />
);
const EventIcon = ({ style }: { style?: React.CSSProperties }) => (
  <IconWithBackground
    type="Events"
    $color="#00665C"
    $backgroundColor="#C8F4E7"
    style={style}
  />
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
