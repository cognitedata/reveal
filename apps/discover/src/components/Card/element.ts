import styled from 'styled-components/macro';

import { Icon } from '@cognite/cogs.js';

import { FlexGrow, FlexColumn, FlexRow, Ellipsis, sizes } from 'styles/layout';

export const CardWrapper = styled(FlexColumn)`
  background-color: var(--cogs-white);
`;

export const CardHeader = styled(FlexRow)`
  height: 68px;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  border-bottom: 2px solid var(--cogs-greyscale-grey3);
`;

export const HeaderLeft = styled(FlexRow)`
  overflow: hidden;
  flex: 1;
  cursor: pointer;
`;

export const AvatarWrapper = styled.div`
  width: 36px;
  height: 36px;
  background-color: #4cc96814;
  margin-left: ${sizes.normal};
  border-radius: 6px;
`;

export const IconWrapper = styled(Icon)`
  margin: 11px 10px;
  color: #4cc968;
`;

export const Title = styled.div`
  ${Ellipsis}

  flex:1;
  margin-left: 12px;
  font-weight: 600;
  font-size: ${sizes.normal};
  position: relative;
  top: ${sizes.small};
`;

export const CardContent = styled(FlexGrow)`
  padding: 12px ${sizes.normal} 20px ${sizes.normal};
  cursor: pointer;
`;

export const HeaderRight = styled(FlexRow)`
  flex-shrink: 0;
  margin-left: 12px;
`;
