import React from 'react';
import { Space } from 'antd';
import { InternalId } from '@cognite/sdk';
import { Icon } from '@cognite/cogs.js';
import { ResourceType, convertResourceType } from 'lib';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import FileDownloadAnchor from 'lib/components/FileDownloadAnchor';

type ItemProps = {
  id: number;
  resourceType: ResourceType;
};
function getText(type: ResourceType, data: any) {
  switch (type) {
    case 'asset':
      return <>{data.name || data.id}</>;
    case 'event':
      return (
        <>
          {data.type} - {data.subtype}
        </>
      );
    case 'file':
      return (
        <Space>
          {data.name}
          <FileDownloadAnchor
            text={<Icon type="Download" />}
            id={{ id: data.id }}
          />
        </Space>
      );
    case 'sequence':
      return <>{data.name || data.id}</>;

    case 'timeSeries':
      return <>{data.name || data.id}</>;

    default:
      return <>{data?.id}</>;
  }
}

function Item({ id, resourceType }: ItemProps) {
  const { data = {} } = useCdfItem(convertResourceType(resourceType), { id });
  return <li key={id}>{getText(resourceType, data)} </li>;
}

type Props = {
  resourceType: ResourceType;
  ids: InternalId[];
};
export default function Summary({ ids, resourceType }: Props) {
  return (
    <ul key={resourceType}>
      {ids.map(i => (
        <Item id={i.id} resourceType={resourceType} />
      ))}
    </ul>
  );
}
