import React from 'react';
import { Button, Menu, Dropdown, notification } from 'antd';
import { Icon } from '@cognite/cogs.js';
import { ResourceType, convertResourceType } from 'lib';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { useEnv, useTenant } from 'lib/hooks/CustomHooks';

type Props = {
  id: number;
  type: ResourceType;
};

const oData = (
  id: number,
  type: ResourceType,
  tenant: string,
  env: string | undefined
) => {
  const baseUrl = `https://${
    env || 'api'
  }.cognitedata.com/odata/v1/projects/${tenant}/`;

  switch (type) {
    case 'asset':
      return `${baseUrl}/Assets(${id})`;
    case 'event':
      return `${baseUrl}/Events(${id})`;
    case 'file':
      return `${baseUrl}/Files(${id})`;
    case 'sequence':
      return `${baseUrl}/Sequences(${id})`;
    case 'timeSeries':
      return `${baseUrl}/Timeseries(${id})`;
    default:
      return '';
  }
};

export default function ({ type, id }: Props) {
  const env = useEnv();
  const tenant = useTenant();

  const { data = {} } = useCdfItem<{ externalId?: string }>(
    convertResourceType(type),
    { id }
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
      <Menu.Item onClick={() => copy(`${id}`)} key="copyId">
        Copy id
      </Menu.Item>
      <Menu.Item
        onClick={() => copy(`${data.externalId}`)}
        key="copyExternalId"
        disabled={!data.externalId}
      >
        Copy external id
      </Menu.Item>
      <Menu.Item
        onClick={() => copy(oData(id, type, tenant, env))}
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
