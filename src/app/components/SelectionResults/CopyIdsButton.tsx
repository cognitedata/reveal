import React from 'react';
import { Button, Menu, Dropdown, notification } from 'antd';
import { Icon } from '@cognite/cogs.js';
import { ResourceType, convertResourceType } from 'lib';
import { useEnv, useTenant } from 'lib/hooks/CustomHooks';
import { InternalId } from '@cognite/sdk';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';

type Props = {
  ids: InternalId[];
  resourceType: ResourceType;
};

const oData = (
  ids: number[],
  type: ResourceType,
  tenant: string,
  env: string | undefined
) => {
  const baseUrl = `https://${
    env || 'api'
  }.cognitedata.com/odata/v1/projects/${tenant}`;
  const filter = ids.map(i => `(Id eq ${i})`).join(' or ');
  switch (type) {
    case 'asset':
      return `${baseUrl}/Assets?$filter=${filter}`;
    case 'event':
      return `${baseUrl}/Events?$filter=${filter}`;
    case 'file':
      return `${baseUrl}/Files?$filter=${filter}`;
    case 'sequence':
      return `${baseUrl}/Sequences?$filter=${filter}`;
    case 'timeSeries':
      return `${baseUrl}/Timeseries?$filter=${filter}`;
    default:
      return '';
  }
};

export default function ({ ids, resourceType }: Props) {
  const env = useEnv();
  const tenant = useTenant();

  const { data = [] } = useCdfItems<{ id: number; externalId?: string }>(
    convertResourceType(resourceType),
    ids
  );

  const copy = async (s: string) => {
    if (s.length > 0) {
      await navigator.clipboard.writeText(`${s}`);
      notification.info({
        key: 'clipboard',
        message: 'Clipboard updated',
        description: `'${s}' is now available in your clipboard.`,
      });
    }
  };

  const menu = (
    <Menu>
      <Menu.Item
        onClick={() => copy(JSON.stringify(ids.map(i => i.id)))}
        key="copyId"
      >
        Copy id
      </Menu.Item>
      <Menu.Item
        onClick={() =>
          copy(JSON.stringify(data.map(i => i.externalId).filter(Boolean)))
        }
        key="copyExternalId"
        disabled={data.map(i => i.externalId).filter(Boolean).length === 0}
      >
        Copy external id
      </Menu.Item>
      <Menu.Item
        onClick={() =>
          copy(
            oData(
              ids.map(i => i.id),
              resourceType,
              tenant,
              env
            )
          )
        }
        key="copyoData"
      >
        Copy oData query (PowerBI)
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Button type="ghost" icon={<Icon type="Copy" />} />
    </Dropdown>
  );
}
