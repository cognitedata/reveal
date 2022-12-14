import { Button, LabelProps, LabelSize, LabelVariants } from '@cognite/cogs.js';
import { useMemo, useState } from 'react';

import { StyledLabel, InfoSpan, StyledModal } from './elements';

type Props = LabelProps & {
  status: 'RUNNING' | 'FINISHED' | 'FAILED' | string;
  size?: LabelSize;
  icon?: string;
  modalContent?: {
    title: string;
    message: string;
  };
};

const variant: Record<string, LabelVariants> = {
  FAILED: 'danger',
  RUNNING: 'normal',
  FINISHED: 'success',
};

export const StatusLabel = ({
  status,
  size = 'medium',
  icon,
  modalContent,
  style,
}: Props) => {
  const [showModal, setShowModal] = useState(false);

  const labelIcon = useMemo(() => {
    if (status === 'RUNNING') return 'Loader';
    if (icon) {
      return icon;
    }
    return undefined;
  }, []);

  const handleOnClick = () => {
    setShowModal(true);
  };

  return (
    <>
      {modalContent && (
        <StyledModal
          title={modalContent.title}
          visible={showModal}
          testId="more-info-modal"
          appElement={
            document.getElementById('root') ?? document.documentElement
          }
          getContainer={() =>
            document.getElementById('root') ?? document.documentElement
          }
          onCancel={() => setShowModal(false)}
          footer={
            <div className="cogs-modal-footer-buttons">
              <Button
                iconPlacement="left"
                icon="Copy"
                type="secondary"
                onClick={() => {
                  if (modalContent.message) {
                    navigator.clipboard.writeText(modalContent.message);
                  }
                }}
              >
                Copy
              </Button>
            </div>
          }
          width={900}
        >
          <InfoSpan>{modalContent.message.replaceAll('\\n', '\n')}</InfoSpan>
        </StyledModal>
      )}
      <StyledLabel
        style={style}
        onClick={modalContent && handleOnClick}
        size={size}
        variant={variant[status] ?? 'unknown'}
        icon={labelIcon}
        iconPlacement="right"
      >
        {status.charAt(0) + status.substring(1).toLowerCase()}
      </StyledLabel>
    </>
  );
};
