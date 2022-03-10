import styled from 'styled-components/macro';

import { Modal } from '@cognite/cogs.js';

import { SubTitleText } from 'components/emptyState/elements';
import { Flex, FlexColumn, FlexRow, sizes } from 'styles/layout';

export const TopBarWrapper = styled(FlexRow)`
  // gap: ${sizes.normal};
  margin-bottom: ${sizes.normal};
  align-items: center;
`;
export const CasingViewListWrapper = styled(FlexRow)`
  gap: ${sizes.normal};
  height: calc(100% - 52px);
  white-space: nowrap;
  overflow: auto;
`;

export const CasingViewListPopupWrapper = styled(CasingViewListWrapper)`
  height: 100%;
`;

export const GroupedCasingsTableWrapper = styled(Flex)`
  height: calc(100% - 52px);
  & > div[role='table'] {
    & > div[role='row'] {
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: -0.001em;
      color: var(--cogs-text-primary);
    }
  }
`;

export const CasingsTableWrapper = styled(Flex)`
  width: 100%;
  div[role='table'] {
    width: 100% !important;
    div[role='row']:last-child {
      div[role='cell'] {
        border: none;
      }
    }
  }
`;

export const CasingViewButtonWrapper = styled(Flex)`
  right: ${(props: { offset: number }) => props.offset}px;
  position: relative;
  & > * button {
    min-width: 110px;
    padding: 4px 8px !important;
  }
`;

export const CasingPreviewFooter = styled(FlexRow)`
  justify-content: flex-end;
  & > * button {
    width: auto;
  }
`;

export const CasingPreviewModalWrapper = styled(Modal)`
  justify-content: flex-end;
  height: calc(100% - 134px);
  width: fit-content !important;

  .casings-np-details-button {
    margin-right: 48px;
    width: 180px;
  }

  & .cogs-modal-close {
    cursor: pointer;
  }
  & .cogs-modal-content {
    padding: 0px !important;
    height: calc(100% - 69px);
    & > div {
      background: var(--cogs-bg-default);
    }
  }
`;

export const SearchBoxWrapper = styled(Flex)`
  width: auto;
`;

export const EmptyStateWrapper = styled(FlexColumn)`
  width: auto;
  height: calc(100% - 52px);
  align-items: center;
  justify-content: center;
  & > div:first-child {
    max-height: 200px;
    white-space: break-spaces;
    max-width: 200px;
    & ${SubTitleText} {
      display: flex;
      align-items: center;
      text-align: center;
    }

    & div {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 256px;
    }

    img {
      margin-bottom: 32px;
    }

    h6 {
      height: 40px;
      span {
        white-space: break-spaces;
        width: 256px;
        height: 40px;
        line-height: 20px;
        display: flex;
        align-items: center;
        text-align: center;
        letter-spacing: -0.01em;
      }
    }
  }

  & > div:last-child {
    margin-top: 32px;
  }
`;
