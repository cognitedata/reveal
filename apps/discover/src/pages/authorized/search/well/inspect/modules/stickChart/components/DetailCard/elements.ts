import styled, { css } from 'styled-components/macro';
import layers from 'utils/zindex';

import { Flex, FlexColumn, FlexRow, sizes } from 'styles/layout';

export const BaseDetailCardWrapper = styled(FlexColumn)`
  height: auto;
  min-width: 360px;
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

export const DetailCardWrapper = styled(BaseDetailCardWrapper)`
  &:after {
    content: ' ';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -${sizes.small};
    border-width: ${sizes.small};
    border-style: solid;
    border-color: var(--cogs-white) transparent transparent transparent;
  }
`;

export const DetailCardBlockWrapper = styled(FlexRow)`
  gap: ${sizes.small};
  padding: ${sizes.small} 12px;
  background: var(--cogs-greyscale-grey1);
  border-radius: ${sizes.small};
  width: fit-content;
  height: fit-content;
  flex: 1;
  margin: ${sizes.extraSmall};
  ${(props: { $extended: boolean }) =>
    props.$extended &&
    css`
      flex: 2;
      width: 100%;
    `}
`;

export const Avatar = styled.div`
  height: 12px;
  width: 12px;
  border-radius: ${sizes.extraSmall};
  border: 2px var(--cogs-greyscale-grey2) solid;
  background: ${(props: { color: string }) => props.color};
  margin-top: ${sizes.extraSmall};
`;

export const DetailCardBlockTitle = styled(Flex)`
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.006em;
  color: var(--cogs-greyscale-grey9);
  margin-bottom: ${sizes.extraSmall};
`;

export const DetailCardBlockValue = styled(Flex)`
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.003em;
  color: var(--cogs-greyscale-grey9);
`;

export const DetailsWrapper = styled(FlexColumn)`
  width: fit-content;
`;

export const InfoContentWrapper = styled.div`
  opacity: 55%;
  margin-top: 2px;
  margin-right: ${sizes.small};
  cursor: pointer;
`;
