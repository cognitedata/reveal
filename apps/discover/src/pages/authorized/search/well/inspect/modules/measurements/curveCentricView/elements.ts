import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { Flex, FlexColumn, sizes } from 'styles/layout';

export const CurveCentricViewWrapper = styled(FlexColumn)`
  height: 100%;
  gap: ${sizes.normal};
  overflow: auto;
  visibility: ${(props: { visible: boolean }) =>
    props.visible ? 'visible' : 'hidden'};
  flex-flow: row wrap;
`;

export const Wrapper = styled.div`
  background: var(--cogs-greyscale-grey1);
  border-radius: 8px;
  flex: 1 1 50%;
  box-sizing: border-box;
  max-width: calc(50% - 16px);
`;

export const SubHeader = styled(Flex)`
  position: relative;
  width: 100%;
  top: 36px;
  height: 0;
  justify-content: center;

  font-size: 10px;
  line-height: 14px;
  letter-spacing: -0.004em;
  color: var(--cogs-greyscale-grey6);
  z-index: ${layers.TABLE_HEADER};
`;
