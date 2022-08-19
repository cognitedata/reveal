import * as React from 'react';

import { ModalProps } from '@cognite/cogs.js';

import { useResponsive } from 'hooks/useResponsive';

import { CustomModal, ModalContentWrapper } from './elements';

export interface Props extends ModalProps {
  fullWidth?: boolean;
  halfWidth?: boolean;
  thirdWidth?: boolean;
  fourthWidth?: boolean;
}

export const Modal: React.FC<Props> = ({
  width,
  className,

  // Would be nice to refactor this in the near future – Ronald
  fullWidth,
  halfWidth,
  thirdWidth,
  fourthWidth,
  children,
  ...props
}) => {
  const responsive = useResponsive();

  let responsiveWidth;
  if (fullWidth) {
    responsiveWidth = responsive.Modal.FULL_WIDTH;
  }
  if (halfWidth) {
    responsiveWidth = responsive.Modal.HALF_WIDTH;
  }
  if (thirdWidth) {
    responsiveWidth = responsive.Modal.THIRD_WIDTH;
  }
  if (fourthWidth) {
    responsiveWidth = responsive.Modal.FOURTH_WIDTH;
  }

  return (
    <CustomModal
      {...props}
      role="dialog"
      width={width || responsiveWidth}
      appElement={document.getElementById('root') || undefined}
    >
      <ModalContentWrapper className={className}>
        {children}
      </ModalContentWrapper>
    </CustomModal>
  );
};
