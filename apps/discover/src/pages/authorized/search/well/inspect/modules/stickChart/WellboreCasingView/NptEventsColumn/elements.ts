import styled, { css } from 'styled-components/macro';
import layers from 'utils/zindex';

import { Flex, FlexColumn, sizes } from 'styles/layout';

export const DetailCardWrapper = styled(FlexColumn)`
  height: auto;
  width: fit-content;
  flex-wrap: wrap;
  padding: ${sizes.extraSmall};
  background: var(--cogs-white);
  border: 2px solid rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  box-shadow: 0px 8px 16px 4px rgba(0, 0, 0, 0.04),
    0px 2px 12px rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  z-index: ${layers.MAXIMUM};
  align-items: center;
  color: rgba(0, 0, 0, 0.9);
`;

export const DetailCardBlockWrapper = styled(FlexColumn)`
  padding: ${sizes.small} 12px;
  background: var(--cogs-greyscale-grey1);
  border-radius: ${sizes.small};
  width: fit-content;
  height: fit-content;
  flex: 1;
  margin: ${sizes.extraSmall};
  ${(props: { flex: boolean }) =>
    props.flex &&
    css`
      flex: 2;
      width: 100%;
    `}
`;

export const Title = styled(Flex)`
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.006em;
  color: var(--cogs-greyscale-grey9);
  margin-bottom: ${sizes.extraSmall};
`;

export const Value = styled(Flex)`
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.003em;
  color: var(--cogs-greyscale-grey9);
`;

export const NptCodesDataWrapper = styled.div`
  margin-left: ${sizes.small};
  margin-right: ${sizes.small};
`;

export const NptCodeDefinitionWrapper = styled.div`
  opacity: 55%;
  margin-top: 2px;
  margin-right: ${sizes.small};
  cursor: pointer;
`;

export const HighlightEventButton = styled.div`
  cursor: pointer;
  font-size: 12px;
  background: rgba(64, 120, 240, 0.2);
  padding: ${sizes.extraSmall} ${sizes.small};
  border-radius: ${sizes.extraSmall};
  height: fit-content;
`;

export const RemoveHighlightedEventButton = styled(HighlightEventButton)`
  background: #ffffff;
  border: 1px solid #d9d9d9;
`;
