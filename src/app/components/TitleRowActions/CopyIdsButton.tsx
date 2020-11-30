import React from 'react';
import { Menu, Dropdown, notification } from 'antd';
import { Button } from '@cognite/cogs.js';
import { ResourceType, convertResourceType } from 'lib';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { useEnv, useTenant } from 'lib/hooks/CustomHooks';
import { ResourceItem } from 'lib/types';
import { trackUsage } from 'app/utils/Metrics';

type Props = {
  item: ResourceItem;
};

const oData = (
  id: number,
  type: ResourceType,
  tenant: string,
  env: string | undefined
) => {
  const baseUrl = `https://${
    env || 'api'
  }.cognitedata.com/odata/v1/projects/${tenant}`;

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

export default function ({ item: { type, id } }: Props) {
  const env = useEnv();
  const tenant = useTenant();

  const { data = {} } = useCdfItem<{ externalId?: string }>(
    convertResourceType(type),
    { id }
  );

  const copy = async (
    s: string,
    copyType: 'InternalID' | 'ExternalID' | 'oData'
  ) => {
    if (s.length > 0) {
      await navigator.clipboard.writeText(`${s}`);
      trackUsage('Exploration.Action.Copy', { copyType });
      notification.info({
        key: 'clipboard',
        message: 'Clipboard updated',
        description: `'${s}' is now available in your clipboard.`,
      });
    }
  };

  const menu = (
    <Menu>
      <Menu.Item onClick={() => copy(`${id}`, 'InternalID')} key="copyId">
        Copy id
      </Menu.Item>
      <Menu.Item
        onClick={() => copy(`${data.externalId}`, 'ExternalID')}
        key="copyExternalId"
        disabled={!data.externalId}
      >
        Copy external id
      </Menu.Item>
      <Menu.Item
        onClick={() => copy(oData(id, type, tenant, env), 'oData')}
        key="copyoData"
      >
        Copy oData query (PowerBI)
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Button variant="outline" icon="Copy" />
    </Dropdown>
  );
}
