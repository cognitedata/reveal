import QRCode from 'react-qr-code';

import { trackEvent } from '@cognite/cdf-route-tracker';
import { Modal, Body, Flex, toast } from '@cognite/cogs.js';

const HIDE_CODE_URL_PARAM = 'hideCode';
const HIDE_TOOLBAR_URL_PARAM = 'hideToolbar';
const SHARE_URL_PARAM = 'share';
const QR_URL_PARAM = 'qr';

type ShareModalProps = {
  appFileExternalId?: string;
  appName: string;
  onClose: () => void;
};

export const ShareModal = ({
  onClose,
  appName,
  appFileExternalId,
}: ShareModalProps) => {
  const qrUrl = new URL(window.location.href);
  qrUrl.searchParams.set(HIDE_CODE_URL_PARAM, 'true');
  qrUrl.searchParams.set(HIDE_TOOLBAR_URL_PARAM, 'true');
  qrUrl.searchParams.set(QR_URL_PARAM, 'true');

  return (
    <Modal
      visible
      size="small"
      onCancel={onClose}
      onOk={() => {
        trackEvent('StreamlitApps.ShareLink', { appFileExternalId });
        const url = new URL(window.location.href);
        url.searchParams.set(SHARE_URL_PARAM, 'true');
        navigator.clipboard.writeText(url.toString());
        toast.info('Link copied'); // cogs.js toast doesn't show
      }}
      cancelText=""
      okText="Copy link"
      title={`Share ${appName}`}
    >
      <Flex direction="column" gap={8}>
        <Body level={3}>Scan to open on mobile</Body>
        <div style={{ width: '100%', textAlign: 'center' }}>
          <QRCode value={qrUrl.toString()} />
        </div>
      </Flex>
    </Modal>
  );
};
