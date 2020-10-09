import React from 'react';
import { ResourceType, convertResourceType } from 'types';
import { Tabs, CdfCount } from 'components/Common';
import { useResourceFilters } from 'context';
import styled, { css } from 'styled-components';
import { Icon } from '@cognite/cogs.js';

const ResourceMap: Record<ResourceType, string> = {
  asset: 'Assets',
  file: 'Files',
  event: 'Events',
  timeSeries: 'Time series',
  sequence: 'Sequences',
};

type Props = {
  currentResourceType: ResourceType;
  setCurrentResourceType: (newResourceType: ResourceType) => void;
};

// eslint-disable-next-line
// TODO clean up colors
export const ResourceTypeTabs = ({
  currentResourceType,
  setCurrentResourceType,
}: Props) => {
  const {
    assetFilter,
    timeseriesFilter,
    fileFilter,
    sequenceFilter,
    eventFilter,
  } = useResourceFilters();

  const filtersMap: { [key in ResourceType]: any } = {
    asset: assetFilter,
    timeSeries: timeseriesFilter,
    file: fileFilter,
    sequence: sequenceFilter,
    event: eventFilter,
  };
  const iconsMap: { [key in ResourceType]: React.ReactNode } = {
    asset: (
      <IconWithBackground
        type="DataStudio"
        color="#8D1E47"
        backgroundColor="#FDCED6"
      />
    ),
    timeSeries: (
      <IconWithBackground
        type="Timeseries"
        color="#642175"
        backgroundColor="#F4DAF8"
      />
    ),
    file: (
      <IconWithBackground
        type="FolderLine"
        color="#D27200"
        backgroundColor="#FFF1CC"
      />
    ),
    sequence: (
      <IconWithBackground
        type="Duplicate"
        color="#CC512B"
        backgroundColor="#FFE1D1"
      />
    ),
    event: (
      <IconWithBackground
        type="Events"
        color="#00665C"
        backgroundColor="#C8F4E7"
      />
    ),
  };

  return (
    <Tabs
      tab={currentResourceType}
      onTabChange={tab => setCurrentResourceType(tab as ResourceType)}
    >
      {Object.keys(ResourceMap).map(key => {
        const type = key as ResourceType;
        const sdkType = convertResourceType(type);
        return (
          <Tabs.Pane
            key={type}
            title={
              <div>
                {iconsMap[type]}
                {ResourceMap[type]}{' '}
                <CdfCount type={sdkType} filter={filtersMap[type]} />
              </div>
            }
          />
        );
      })}
    </Tabs>
  );
};

const IconWithBackground = styled(Icon)<{
  backgroundColor: string;
  color: string;
}>(
  props => css`
    padding: 8px;
    background-color: ${props.backgroundColor};
    color: ${props.color};
    border-radius: 4px;
    margin-right: 10px;
  `
);
