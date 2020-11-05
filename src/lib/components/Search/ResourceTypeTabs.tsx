import React from 'react';
import { ResourceType } from 'lib/types';
import { Tabs } from 'lib/components';
import { ResourceIcons } from 'lib/components/ResourceIcons/ResourceIcons';

const resourceTypeMap: Record<ResourceType, string> = {
  asset: 'Assets',
  file: 'Files',
  event: 'Events',
  timeSeries: 'Time series',
  sequence: 'Sequences',
};
const defaultResourceTypes: ResourceType[] = [
  'asset',
  'file',
  'timeSeries',
  'event',
  'sequence',
];

type Props = {
  resourceTypes?: ResourceType[];
  currentResourceType: ResourceType;
  setCurrentResourceType: (newResourceType: ResourceType) => void;
};

export const ResourceTypeTabs = ({
  currentResourceType,
  setCurrentResourceType,
  resourceTypes = defaultResourceTypes,
}: Props) => {
  return (
    <Tabs
      tab={currentResourceType}
      onTabChange={tab => setCurrentResourceType(tab as ResourceType)}
    >
      {resourceTypes.map(key => {
        const type = key as ResourceType;
        return (
          <Tabs.Pane
            key={type}
            title={
              <div>
                <ResourceIcons style={{ marginRight: 12 }} type={type} />
                {resourceTypeMap[type]}
              </div>
            }
          />
        );
      })}
    </Tabs>
  );
};
