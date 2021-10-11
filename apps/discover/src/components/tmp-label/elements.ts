import styled, { css } from 'styled-components/macro';

import { Tag } from '@cognite/cogs.js';

import { sizes } from 'styles/layout';

export const TmpLabel = styled(Tag)`
  display: inline-flex;
  padding: 2px ${sizes.small};
  border: none !important;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  background-color: rgba(0, 0, 0, 0.05) !important;
  color: var(--cogs-text-color-secondary) !important;
  margin-right: ${sizes.small};
  white-space: nowrap;
  user-select: none;
  flex-direction: row;
  max-width: 100%;

  ${(props: any) =>
    props.iconplacement === 'right' &&
    css`
      flex-direction: row-reverse;

      & i.cogs-icon {
        margin-right: 0px !important;
        margin-left: ${sizes.small};
      }
    `}

  ${(props: any) =>
    props.color === 'Danger' &&
    css`
      background-color: rgba(213, 26, 70, 0.1) !important;
      color: #b30539 !important;
    `}

  ${(props: any) =>
    props.color === 'Success' &&
    css`
      background-color: rgba(24, 175, 142, 0.1) !important;
      color: #037d6b !important;
    `}

  ${(props: any) =>
    props.color === 'Normal' &&
    css`
      background-color: rgba(53, 122, 226, 0.1) !important;
      color: #357ae2 !important;
    `}

  ${(props: any) =>
    props.color === 'Info' &&
    css`
      background-color: rgba(66, 85, 187, 0.1) !important;
      color: #4255bb !important;
    `}
`;

export const Content = styled.div`
  flex: 1;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;
