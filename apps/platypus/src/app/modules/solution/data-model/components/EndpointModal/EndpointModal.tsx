import { Button, Flex } from '@cognite/cogs.js';
import { ModalDialog } from '@platypus-app/components/ModalDialog/ModalDialog';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { Notification } from '@platypus-app/components/Notification/Notification';
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
    <ModalDialog
      visible
      title={t('data_model_endpoint_modal_title', 'URL to GraphQl endpoint')}
      onOk={props.onRequestClose}
      onCancel={props.onRequestClose}
      okButtonName={t('data_model_endpoint_modal_ok_button', 'Close')}
      okType="primary"
      width="620px"
      cancelHidden
    >
      <Flex>
        <StyledEndpoint data-cy="endpoint-url">{props.endpoint}</StyledEndpoint>
        <Button onClick={handleCopyClick} icon="Copy">
          {t('data_model_endpoint_modal_copy_button_text', 'Copy')}
        </Button>
      </Flex>
    </ModalDialog>
  );
};
