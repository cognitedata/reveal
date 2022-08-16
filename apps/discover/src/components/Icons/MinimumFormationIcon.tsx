import styled from 'styled-components/macro';

import { Icon } from '@cognite/cogs.js';

export const IconWrapper = styled.div`
  background: var(--cogs-decorative--grayscale--600);
  width: 100%;
  height: 8px;
  margin: 1px 0px;
  display: flex;
  justify-content: space-around;
  align-items: center;
`;
export const MinimumFormationIcon = () => {
  return (
    <IconWrapper>
      <Icon type="EllipsisHorizontal" />
    </IconWrapper>
  );
};
