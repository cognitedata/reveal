import styled from 'styled-components/macro';

import layers from '_helpers/zindex';
import { Flex, FlexColumn, sizes } from 'styles/layout';

export const CurveCentricViewWrapper = styled(FlexColumn)`
  height: 100%;
  gap: ${sizes.normal};
  overflow: auto;
  visibility: ${(props: { visible: boolean }) =>
    props.visible ? 'visible' : 'hidden'};
`;

export const Wrapper = styled(FlexColumn)`
  background: var(--cogs-greyscale-grey1);
  border-radius: 8px;
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
