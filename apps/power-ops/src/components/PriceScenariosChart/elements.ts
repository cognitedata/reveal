import styled from 'styled-components/macro';
import { Title, Body } from '@cognite/cogs.js';
import { sizes } from 'styles/layout';
import layers from 'utils/zindex';

export const StyledTitle = styled(Title)`
  font-family: 'Inter';
`;

export const TooltipCard = styled.div`
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  z-index: ${layers.MAXIMUM};
  flex-direction: column;
  justify-content: center;
  background: #ffffff;
  font-family: 'Inter';
  min-height: 140px;
  height: 140px;
  width: 320px;
  padding: 8px 0 0 8px;
  border-radius: 10px;
  border: 2px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0px 8px 16px 4px rgba(0, 0, 0, 0.04),
    0px 2px 12px rgba(0, 0, 0, 0.08);
  pointer-events: none;
  transform: translateX(67%);

  &.hover {
    display: flex;
  }
  &.align-right {
    transform: translateX(-55%);
  }
`;

export const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
`;

export const CardSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;
  white-space: nowrap;
  background: var(--cogs-bg-accent);

  height: 57px;
  min-width: fit-content;
  width: 100%;
  :last-child {
    max-width: 82px;
  }

  padding: 8px 12px;
  margin: 0 8px 8px 0;
  border-radius: ${sizes.small};
`;

export const CardTitle = styled(Body)`
  color: var(--cogs-text-primary);
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
`;

export const CardText = styled(Body)`
  display: block;
  color: var(--cogs-text-primary);
  font-size: 13px;
  line-height: 18px;
  margin-top: ${sizes.extraSmall};
`;

export const ColorIndicator = styled.div`
  align-self: center;
  background: ${(props: { color: string }) => props.color};
  margin-right: 14px;
  width: 12px;
  height: 12px;
  border-radius: ${sizes.extraSmall};
  box-shadow: 0 0 0 2px rgba(64, 64, 64, 0.04);
`;
