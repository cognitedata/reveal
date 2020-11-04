import React from 'react';
import { ResourceType, convertResourceType } from 'lib/types';
import { Tabs, CdfCount } from 'lib/components';
import { useResourceFilters } from 'lib/context';
import { ResourceIcons } from 'lib/components/ResourceIcons/ResourceIcons';

const resourceTypeMap: Record<ResourceType, string> = {
  asset: 'Assets',
  file: 'Files',
  event: 'Events',
  timeSeries: 'Time series',
  sequence: 'Sequences',
};

type Props = {
  resourceTypes?: ResourceType[];
  currentResourceType: ResourceType;
  setCurrentResourceType: (newResourceType: ResourceType) => void;
};

export const ResourceTypeTabs = ({
  currentResourceType,
  setCurrentResourceType,
  resourceTypes = Object.keys(resourceTypeMap) as ResourceType[],
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
      {resourceTypes.map(key => {
        const type = key as ResourceType;
        const sdkType = convertResourceType(type);
        return (
          <Tabs.Pane
            key={type}
            title={
              <div>
                <ResourceIcons style={{ marginRight: 12 }} type={type} />
                {resourceTypeMap[type]}{' '}
                <CdfCount type={sdkType} filter={filtersMap[type]} />
              </div>
            }
          />
        );
      })}
    </Tabs>
  );
};
