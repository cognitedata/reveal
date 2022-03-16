import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { Flex, sizes } from 'styles/layout';

export const NptEventsDataControlArea = styled(Flex)`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${sizes.normal};
  z-index: ${layers.FILTER_BOX};
`;

export const NptCodeAvatar = styled.div`
  height: 12px;
  width: 12px;
  border-radius: ${sizes.extraSmall};
  border: 2px var(--cogs-greyscale-grey2) solid;
  background-color: ${(props: { color: string }) => props.color};
  margin-right: ${sizes.extraSmall};
`;
