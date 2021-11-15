import { Button, Title } from '@cognite/cogs.js';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { StyledModal } from './elements';

type ModalDialogProps = {
  visible: boolean;
  title: string;
  children: React.ReactNode | string;
  onCancel: VoidFunction;
  cancelHidden?: boolean;
  onOk: VoidFunction;
  okButtonName?: string;
  okDisabled?: boolean;
  okProgress?: boolean;
};

export const ModalDialog = ({
  visible,
  title,
  children,
  onCancel,
  cancelHidden,
  onOk,
  okButtonName,
  okDisabled,
  okProgress,
}: ModalDialogProps) => {
  const { t } = useTranslation('solutions');

  return (
    <StyledModal
      visible={visible}
      title={null}
      footer={null}
      onCancel={() => onCancel()}
    >
      <div className="title">
        <Title level={4}>{title}</Title>
      </div>
      {children}
      <div className="buttons">
        {!cancelHidden && (
          <Button
            type="ghost"
            onClick={() => onCancel()}
            style={{ marginRight: '10px' }}
          >
            {t('cancel', 'Cancel')}
          </Button>
        )}
        <Button
          onClick={() => onOk()}
          disabled={okDisabled}
          type="primary"
          loading={okProgress}
        >
          {okButtonName || t('ok', 'Ok')}
        </Button>
      </div>
    </StyledModal>
  );
};
