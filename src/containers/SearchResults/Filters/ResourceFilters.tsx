import React from 'react';
import { ResourceType } from 'types';
import { Title } from '@cognite/cogs.js';
import { ListItem } from 'components/Common';
import CdfCount from 'components/Common/atoms/CdfCount';
import { sdkResourceTypes, SdkResourceType } from 'hooks/sdk';

const ResourceMap: { [key in SdkResourceType]: string } = {
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
      {sdkResourceTypes.map(el => (
        <ListItem
          key={el}
          onClick={() =>
            setCurrentResourceType(
              el.substring(0, el.length - 1) as ResourceType
            )
          }
          selected={el.includes(currentResourceType)}
          title={ResourceMap[el]}
        >
          <CdfCount type={el} filter={filter} />
        </ListItem>
      ))}
    </>
  );
}
