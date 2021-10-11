import React from 'react';

import { DialogTitle, DialogContent, DialogActions } from '@material-ui/core';

import { Button } from '@cognite/cogs.js';

import { StyledDialog } from './elements';

interface Props {
  isopen?: boolean;
  handleClose?: (state: boolean) => void;
  title?: string;
}

export const DialogPopup: React.FC<Props> = ({
  isopen = true,
  handleClose,
  title,
  children,
}) => {
  const onDialogClose = () => {
    if (handleClose) {
      handleClose(false);
    }
  };
  return (
    <StyledDialog
      fullScreen
      open={isopen}
      onClose={onDialogClose}
      aria-labelledby="max-width-dialog-title"
    >
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onDialogClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default DialogPopup;
