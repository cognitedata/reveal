import React from 'react';
import { Menu, Dropdown, notification } from 'antd';
import { Button } from '@cognite/cogs.js';
import { ResourceType } from 'lib';
import { useEnv, useTenant } from 'lib/hooks/CustomHooks';
import { ResourceItem, convertResourceType } from 'lib/types';
import { trackUsage } from 'app/utils/Metrics';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

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

export const copyIdsToClipboard = async (
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

export function PowerBIButton({ item: { type, id } }: Props) {
  const env = useEnv();
  const tenant = useTenant();

  const menu = (
    <Menu>
      <Menu.Item
        onClick={() =>
          copyIdsToClipboard(oData(id, type, tenant, env), 'oData')
        }
        key="copyoData"
      >
        Copy oData query
      </Menu.Item>
      <Menu.Item key="copyId">
        <a
          href="https://docs.cognite.com/cdf/dashboards/guides/powerbi/getting_started.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn about the PowerBI connector
        </a>
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Button variant="outline" icon="PowerBI">
        PowerBI
      </Button>
    </Dropdown>
  );
}

export function GrafanaButton({ item: { type, id } }: Props) {
  const { data } = useCdfItem<{ externalId?: string }>(
    convertResourceType(type),
    { id }
  );

  const menu = (
    <Menu>
      <Menu.Item
        disabled={!data?.externalId}
        onClick={() =>
          data?.externalId && copyIdsToClipboard(data?.externalId, 'ExternalID')
        }
        key="copyExternalId"
      >
        Copy external id
      </Menu.Item>
      <Menu.Item key="grafanaLink">
        <a
          href="https://docs.cognite.com/cdf/dashboards/guides/grafana/getting_started.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn about the Grafana connector
        </a>
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Button variant="outline" icon="LineChart">
        Grafana
      </Button>
    </Dropdown>
  );
}
