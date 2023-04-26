import { notification } from 'antd';
import { trackUsage } from '@data-exploration-app/utils/Metrics';

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
