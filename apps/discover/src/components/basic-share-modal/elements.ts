import styled from 'styled-components/macro';

import { Modal } from '@cognite/cogs.js';

import { Flex, FlexRow, sizes } from 'styles/layout';

export const CustomModal = styled(Modal)`
  & .cogs-modal-header {
    padding: 22px ${sizes.normal} !important;
    font-size: var(--cogs-t4-font-size) !important;
    line-height: var(--cogs-t4-line-height) !important;
  }
  & .cogs-modal-content {
    padding: ${sizes.normal};
  }
`;

export const BasicShareModalContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  padding-top: ${sizes.extraSmall};
  flex-direction: column;
`;

export const SearchUsersWrapper = styled.div`
  width: 100%;
  border-radius: 6px;
  margin-right: 12px;
  & > * .cogs-select__control {
    border: 1px solid var(--cogs-greyscale-grey3) !important;
  }
`;

export const SharedWithHeader = styled(FlexRow)`
  font-weight: 500;
  font-size: var(--cogs-t6-font-size);
  line-height: var(--cogs-t6-line-height);
  letter-spacing: -0.001em;
  color: var(--cogs-greyscale-grey9);
  margin-top: ${sizes.normal};
  margin-bottom: ${sizes.extraSmall};
`;

export const SharedWithUserRow = styled(FlexRow)`
  font-weight: 500;
  font-size: var(--cogs-t6-font-size);
  line-height: var(--cogs-t6-line-height);
  letter-spacing: -0.001em;
  color: var(--cogs-greyscale-grey9);
  margin-top: ${sizes.normal};
  align-items: center;
`;

export const SharedWithUserIcon = styled(Flex)`
  width: 36px;
  height: 36px;
  background: var(--cogs-midblue-7);
  border: 2px solid rgba(51, 51, 51, 0.04);
  box-sizing: border-box;
  border-radius: 6px;
  margin-right: ${sizes.normal};
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: var(--cogs-t6-font-size);
  line-height: var(--cogs-t6-line-height);
  letter-spacing: -0.001em;
  color: var(--cogs-greyscale-grey9);
`;

export const SharedWithUserName = styled(FlexRow)`
  font-weight: 500;
  font-size: var(--cogs-t6-font-size);
  line-height: var(--cogs-t6-line-height);
  letter-spacing: -0.001em;
  color: var(--cogs-greyscale-grey9);
`;

export const SharedWithUserEmail = styled(Flex)`
  font-size: var(--cogs-o2-font-size);
  line-height: var(--cogs-o2-line-height);
  letter-spacing: -0.008em;
  color: var(--cogs-greyscale-grey7);
  font-weight: 400;
`;

export const OwnerIndicator = styled(Flex)`
  font-size: var(--cogs-o2-font-size);
  line-height: var(--cogs-o2-line-height);
  letter-spacing: -0.008em;
  color: var(--cogs-greyscale-grey6);
  align-items: center;
  margin-left: 6px;
`;
