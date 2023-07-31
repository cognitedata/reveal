import styled from 'styled-components/macro';

import { Tag as CogsTag } from '@cognite/cogs.js';

import { sizes } from 'styles/layout';

export const Tag = styled(CogsTag)`
  border: none !important;
  border-radius: ${sizes.extraSmall} !important;
  margin-right: ${sizes.small} !important;
  height: ${sizes.medium} !important;

  #Vector {
    stroke-width: 3;
  }
`;

export const ClearTagWrapper = styled(Tag)`
  background-color: var(--cogs-bg-control--secondary) !important;
`;

export const BlueFilterTagWrapper = styled(Tag)`
  background-color: var(bg-selected) !important;
  color: var(--cogs-midblue-2) !important;
`;
export const GrayFilterTagWrapper = styled(Tag)`
  background-color: var(--cogs-grayscale-gray1) !important;
  border: 1px solid var(--cogs-border-default) !important;
`;
