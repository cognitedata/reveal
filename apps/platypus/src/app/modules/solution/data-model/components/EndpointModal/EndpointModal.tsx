import { Button, Flex, Modal } from '@cognite/cogs.js';

import { Notification } from '../../../../../components/Notification/Notification';
import { useTranslation } from '../../../../../hooks/useTranslation';

import { StyledEndpoint } from './elements';

export interface EndpointModalProps {
  endpoint: string;
  onRequestClose: () => void;
}

export const EndpointModal: React.FC<EndpointModalProps> = (props) => {
  const { t } = useTranslation('DataModelEndpointModal');

  const handleCopyClick = () => {
    navigator.clipboard.writeText(props.endpoint);
    Notification({
      type: 'success',
      message: t(
        'data_model_endpoint_modal_copied_toast_message',
        'Copied to clipboard'
      ),
    });
  };

  return (
    <Modal
      visible
      title={t('data_model_endpoint_modal_title', 'URL to GraphQl endpoint')}
      onOk={props.onRequestClose}
      onCancel={props.onRequestClose}
      hideFooter
    >
      <Flex>
        <StyledEndpoint data-cy="endpoint-url">{props.endpoint}</StyledEndpoint>
        <Button onClick={handleCopyClick} icon="Copy">
          {t('data_model_endpoint_modal_copy_button_text', 'Copy')}
        </Button>
      </Flex>
    </Modal>
  );
};
