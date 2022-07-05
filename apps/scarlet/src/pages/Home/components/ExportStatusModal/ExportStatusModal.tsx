import { Button, Icon } from '@cognite/cogs.js';

import * as Styled from './style';

type ExportStatusModalProps = {
  visible: boolean;
  error: any;
  onClose: () => void;
  retry?: () => void;
};

export const ExportStatusModal = ({
  visible,
  error,
  onClose,
  retry,
}: ExportStatusModalProps) => {
  return (
    <Styled.ExportStatusModal
      appElement={document.getElementById('root') || undefined}
      footer={null}
      closable={Boolean(error)}
      width={error ? 300 : 372}
      closeIcon={!error ? null : undefined}
      visible={visible}
      onCancel={onClose}
    >
      <Styled.Title className="cogs-body-1 strong" error={Boolean(error)}>
        {!error ? (
          <>
            <Icon type="Loader" />
            Exporting data...
          </>
        ) : (
          <>
            <Icon type="WarningTriangleFilled" />
            Export failed
          </>
        )}
      </Styled.Title>
      <Styled.Description className="cogs-body-2">
        {error
          ? 'An error occurred while exporting data. You can try exporting again.'
          : 'We are running the export. Once done, the spreadsheet file will be sent to you.'}
      </Styled.Description>
      {error ? (
        <Styled.ButtonGroup>
          {retry && (
            <Button type="primary" onClick={retry}>
              Try again
            </Button>
          )}

          <Button type="tertiary" onClick={onClose}>
            Close
          </Button>
        </Styled.ButtonGroup>
      ) : (
        <Styled.ProgressBar />
      )}
    </Styled.ExportStatusModal>
  );
};
