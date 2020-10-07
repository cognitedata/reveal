import React from 'react';
import { ResourceType } from 'types';
import { Title } from '@cognite/cogs.js';
import { ListItem, CdfCount } from 'components/Common';
import { SdkResourceType } from 'hooks/sdk';

type FilterTypes = Exclude<SdkResourceType, 'datasets'>;
const ResourceMap: Record<FilterTypes, string> = {
  assets: 'Assets',
  files: 'Files',
  events: 'Events',
  timeseries: 'Time series',
  sequences: 'Sequences',
};

type Props = {
  currentResourceType: ResourceType;
  setCurrentResourceType: (newResourceType: ResourceType) => void;
  filter?: any;
};

const typeMapping = (s: string): string => {
  switch (s) {
    case 'timeseries': {
      return 'timeSeries';
    }
    default: {
      return s.substring(0, s.length - 1);
    }
  }
};

export default function ResourceFilters({
  currentResourceType,
  setCurrentResourceType,
  filter,
}: Props) {
  return (
    <>
      <Title level={4} style={{ marginBottom: 12 }} className="title">
        Resource types
      </Title>
      {Object.keys(ResourceMap).map(type => (
        <ListItem
          key={type}
          onClick={() => {
            setCurrentResourceType(
              typeMapping(type as FilterTypes) as ResourceType
            );
          }}
          selected={type.includes(currentResourceType)}
          title={ResourceMap[type as FilterTypes]}
        >
          <CdfCount type={type as FilterTypes} filter={filter} />
        </ListItem>
      ))}
    </>
  );
}
