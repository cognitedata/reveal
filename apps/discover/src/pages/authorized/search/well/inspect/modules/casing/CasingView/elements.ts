import styled from 'styled-components/macro';

import { SubTitleText } from 'components/EmptyState/elements';
import { Flex, FlexColumn, FlexRow, sizes } from 'styles/layout';

import { Description } from './DepthIndicator/elements';

export const DepthIndicatorGutter = styled(Description)`
  display: inline-block;
  visibility: hidden;
`;

export const Wrapper = styled(FlexColumn)`
  height: 100%;
  width: fit-content;
  background: var(--cogs-bg-accent);
  border-radius: 12px;
`;

export const Header = styled(FlexRow)`
  gap: 32px;
  padding: ${sizes.normal};
  box-shadow: inset 0px -1px 0px var(--cogs-greyscale-grey3);
`;

export const MainHeader = styled(Flex)`
  width: 100%;
  font-weight: 600;
  font-size: ${sizes.normal};
  line-height: 20px;
  align-items: center;
  letter-spacing: -0.01em;
  color: var(--cogs-greyscale-grey9);
`;

export const SubHeader = styled(Flex)`
  width: 100%;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  align-items: center;
  letter-spacing: -0.004em;
  color: rgba(0, 0, 0, 0.45);
  margin-top: ${sizes.extraSmall};
`;

export const EmptyCasingsStateWrapper = styled(Flex)`
  white-space: break-spaces;
  max-width: 200px;
  height: 100%;
  & ${SubTitleText} {
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    display: flex;
    align-items: center;
    text-align: center;
    letter-spacing: -0.004em;
    padding-top: 0;
    justify-content: center;
  }
`;
