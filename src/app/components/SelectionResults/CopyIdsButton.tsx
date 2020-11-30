import React from 'react';
import { Menu, Dropdown } from 'antd';
import { Button } from '@cognite/cogs.js';
import { ResourceType, convertResourceType } from 'lib';
import { useEnv, useTenant } from 'lib/hooks/CustomHooks';
import { InternalId } from '@cognite/sdk';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import { copyIdsToClipboard } from '../TitleRowActions/CopyIdsButton';

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

export function PowerBIButton({ ids, resourceType }: Props) {
  const env = useEnv();
  const tenant = useTenant();

  const menu = (
    <Menu>
      <Menu.Item
        onClick={() =>
          copyIdsToClipboard(
            oData(
              ids.map(i => i.id),
              resourceType,
              tenant,
              env
            ),
            'oData'
          )
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

export function GrafanaButton({ ids, resourceType }: Props) {
  const { data = [] } = useCdfItems<{ id: number; externalId?: string }>(
    convertResourceType(resourceType),
    ids
  );

  const externalIds = data.map(d => d.externalId).filter(Boolean);

  const menu = (
    <Menu>
      <Menu.Item
        disabled={externalIds.length === 0}
        onClick={() => copyIdsToClipboard(externalIds.join(', '), 'ExternalID')}
        key="copyoData"
      >
        Copy external ids
      </Menu.Item>
      <Menu.Item key="copyId">
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
