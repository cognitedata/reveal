import React, { Dispatch, ReactNode, SetStateAction, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ToastOptions } from 'react-toastify';

import styled from 'styled-components/macro';

import { toast as cogniteToast, Button } from '@cognite/cogs.js';

import { FlexRow } from 'styles/layout';

interface Props {
  visible?: boolean;
  setVisible?: Dispatch<SetStateAction<boolean>>;
  callback: () => void;
  onUndo?: () => void;
  duration?: number;
  children?: ReactNode;
}

const StyledToast = styled(FlexRow)`
  justify-content: space-between;
  align-items: center;
`;

export const UndoToast: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  let runCallback = true;

  const handleUndoClick = () => {
    runCallback = false; // Don't run the callback
    cogniteToast.dismiss(); // Close the toast

    if (props.onUndo) {
      props.onUndo();
    }
  };

  const onClose = () => {
    if (runCallback && props.callback) {
      // The user did not click 'undo'
      props.callback();
    }

    if (props.setVisible) {
      props.setVisible(false);
    }
  };

  const style = {
    width: '600px!important',
  };

  const option: ToastOptions = {
    style,
    autoClose: props.duration || 5000,
    pauseOnHover: true,
    draggable: true,
    closeOnClick: false,
    onClose,
  };

  const renderToastContent = () => (
    <StyledToast>
      {props.children}
      <Button onClick={handleUndoClick} aria-label="Undo">
        {t('Undo')}
      </Button>
    </StyledToast>
  );

  useEffect(() => {
    if (props.visible) {
      cogniteToast.open(renderToastContent, option);
    } else {
      cogniteToast.dismiss();
    }
  }, [props.visible]);

  return null;
};

export default UndoToast;
