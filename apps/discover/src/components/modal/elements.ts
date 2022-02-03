import styled from 'styled-components/macro';

import { Modal } from '@cognite/cogs.js';

import { sizes } from 'styles/layout';

export const MODAL_BORDER_RADIUS = sizes.small;
export const MODAL_PADDING = sizes.normal;

export const CustomModal = styled(Modal)`
  border-radius: ${MODAL_BORDER_RADIUS} !important;
  & .cogs-modal-header {
    padding-left: ${MODAL_PADDING} !important;
  }
  & .cogs-modal-content {
    padding: ${MODAL_PADDING};
  }
`;

export const ModalContentWrapper = styled.div`
  box-sizing: content-box;
  height: 100%;
  & input,
  .input-wrapper {
    width: 100%;
  }
  & .input-wrapper {
    margin-bottom: 10px;
  }
  & button {
    white-space: nowrap;
    height: 36px;
  }
`;

export const ModalFullWidthContainer = styled.div`
  margin-left: -${MODAL_PADDING};
  margin-right: -${MODAL_PADDING};
  padding: ${MODAL_PADDING};
`;

export const RoundedModalStyle = {
  borderRadius: '8px',
  top: 'calc(50% - 130px)',
};
