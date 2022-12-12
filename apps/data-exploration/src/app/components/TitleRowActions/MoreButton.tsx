import { notification } from 'antd';
import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import {
  ResourceType,
  ResourceItem,
  useEnv,
  useTenant,
} from '@cognite/data-exploration';

import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { EXPLORATION } from '@data-exploration-app/constants/metrics';

type Props = {
  item: ResourceItem;
};

const oData = (
  id: number,
  type: ResourceType,
  tenant: string | undefined,
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

export function MoreButton({ item: { type, id } }: Props) {
  const env = useEnv();
  const tenant = useTenant();

  const menu = (
    <Menu>
      <Menu.Item
        onClick={() => {
          copyIdsToClipboard(oData(id, type, tenant!, env), 'oData');
          trackUsage(EXPLORATION.COPY.O_DATA, { id, type, tenant });
        }}
        key="copyoData"
      >
        Copy oData query
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown content={menu} openOnHover={false}>
      <Button icon="EllipsisHorizontal" aria-label="More" />
    </Dropdown>
  );
}
