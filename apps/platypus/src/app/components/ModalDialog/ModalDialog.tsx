import { Button, ButtonType, Title } from '@cognite/cogs.js';
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
  okType?: ButtonType;
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
  okType,
  ...rest
}: ModalDialogProps) => {
  const { t } = useTranslation('solutions');

  return (
    <StyledModal
      visible={visible}
      title={null}
      footer={null}
      onCancel={() => onCancel()}
      appElement={document.body}
      {...rest}
    >
      <div className="title">
        <Title data-cy="modal-title" level={4}>
          {title}
        </Title>
      </div>
      {children}
      <div className="buttons">
        {!cancelHidden && (
          <Button
            type="ghost"
            onClick={() => onCancel()}
            data-cy="modal-cancel-button"
            style={{ marginRight: '10px' }}
          >
            {t('cancel', 'Cancel')}
          </Button>
        )}
        <Button
          onClick={() => onOk()}
          disabled={okDisabled}
          loading={okProgress}
          type={okType}
          data-cy="modal-ok-button"
        >
          {okButtonName || t('ok', 'Ok')}
        </Button>
      </div>
    </StyledModal>
  );
};
