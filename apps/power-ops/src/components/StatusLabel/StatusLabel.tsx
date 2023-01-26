import { ChipProps, ChipSize, Button, Modal } from '@cognite/cogs.js-v9';
import { useMemo, useState } from 'react';

import { StyledChip, InfoSpan, CustomFooter } from './elements';

type Props = ChipProps & {
  status: 'RUNNING' | 'FINISHED' | 'FAILED' | string;
  size?: ChipSize;
  icon?: string;
  modalContent?: {
    title: string;
    message: string;
  };
};

const variant: Record<string, string> = {
  FAILED: 'danger',
  RUNNING: 'neutral',
  FINISHED: 'success',
};

export const StatusLabel = ({
  status,
  size = 'small',
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
  }, [status]);

  const handleOnClick = () => {
    setShowModal(true);
  };

  return (
    <>
      {modalContent && (
        <Modal
          title={modalContent.title}
          visible={showModal}
          data-testid="more-info-modal"
          getContainer={() =>
            document.getElementById('root') ?? document.documentElement
          }
          hideFooter
          onCancel={() => setShowModal(false)}
        >
          <InfoSpan>{modalContent.message.replaceAll('\\n', '\n')}</InfoSpan>
          <CustomFooter>
            <Button
              type="ghost"
              icon="Copy"
              iconPlacement="left"
              onClick={() => {
                if (modalContent.message) {
                  navigator.clipboard.writeText(modalContent.message);
                }
              }}
            >
              Copy
            </Button>
          </CustomFooter>
        </Modal>
      )}
      <StyledChip
        style={style}
        onClick={modalContent && handleOnClick}
        size={size}
        type={variant[status] ?? 'default'}
        icon={labelIcon}
        iconPlacement="right"
        label={status.charAt(0) + status.substring(1).toLowerCase()}
      />
    </>
  );
};
