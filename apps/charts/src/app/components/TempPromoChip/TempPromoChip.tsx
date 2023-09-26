/**
 * Remove this in favor of PromoChip from cogs when it is updated any version above 9.41.0
 */
import { PropsWithChildren } from 'react';

import styled from 'styled-components';

import { Tooltip } from '@cognite/cogs.js';

const PromoChip = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 8px;
  width: fit-content;
  color: white;
  background-color: var(--cogs-text-icon--strong);
  border-radius: 100px;
  font-weight: 500;
  max-width: 200px;
  padding: 2px 8px;
  font-size: var(--cogs-body-x-small-font-size);
  letter-spacing: var(--cogs-body-x-small-letter-spacing);
  line-height: var(--cogs-body-x-small-line-height);
`;

export const TempPromoChip = ({
  children,
  tooltip,
}: PropsWithChildren<{ tooltip: string }>) => {
  return (
    <Tooltip content={tooltip}>
      <PromoChip>{children}</PromoChip>
    </Tooltip>
  );
};
