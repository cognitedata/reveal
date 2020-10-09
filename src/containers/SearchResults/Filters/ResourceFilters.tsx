import React from 'react';
import { ResourceType, convertResourceType } from 'types';
import { Tabs, CdfCount } from 'components/Common';
import { useResourceFilters } from 'context';
import styled from 'styled-components';
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

export const ResourceFilters = ({
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

  return (
    <Tabs
      tab={currentResourceType}
      onTabChange={tab => setCurrentResourceType(tab as ResourceType)}
    >
      {Object.keys(ResourceMap).map(type => {
        const sdkType = convertResourceType(type as ResourceType);
        return (
          <Tabs.Pane
            key={type}
            title={
              <div>
                <IconWithBackground type="DataStudio" />
                {ResourceMap[type as ResourceType]}{' '}
                <CdfCount
                  type={sdkType}
                  filter={filtersMap[type as ResourceType]}
                />
              </div>
            }
          />
        );
      })}
    </Tabs>
  );
};

const IconWithBackground = styled(Icon)`
  padding: 8px;
  background-color: red;
  color: blue;
  border-radius: 4px;
  margin-right: 10px;
`;
