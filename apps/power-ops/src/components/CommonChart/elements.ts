import Plot from 'react-plotly.js';
import styled from 'styled-components/macro';
import layers from 'utils/zindex';
import { sizes } from 'styles/layout';
import { Body } from '@cognite/cogs.js';

export const Container = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--cogs-surface--medium);
  border-radius: 12px;
  padding: 16px;
  height: 100%;

  .cogs-detail {
    color: var(--cogs-text-icon--muted);
    margin-top: 4px;
  }
`;

export const TooltipWrapper = styled.div`
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  z-index: ${layers.MAXIMUM};
  transform: translateX(0);
  margin-left: 16px;

  &.left-from-point {
    transform: translateX(-100%);
    margin-left: -16px;
  }
`;

export const StyledPlot = styled(Plot)`
  .draglayer {
    .nsewdrag {
      cursor: pointer;
    }
  }
  .hovertext {
    display: none !important;
  }
`;

export const TooltipCard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: var(--cogs-surface--muted);
  font-family: 'Inter';
  padding: 8px 0 0 8px;
  width: 360px;
  border-radius: 10px;
  border: 2px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0px 8px 16px 4px rgba(0, 0, 0, 0.04),
    0px 2px 12px rgba(0, 0, 0, 0.08);
  pointer-events: none;
`;

export const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
`;

export const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

export const CardSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;
  white-space: nowrap;
  background: var(--cogs-bg-accent);

  min-width: fit-content;
  width: 100%;
  :not(:first-child) {
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
`;

export const Indicator = styled.div`
  align-self: flex-start;
  margin-right: 14px;
  margin-top: 8px;
  width: 12px;
  height: 4px;
  border-radius: ${sizes.extraSmall};
  box-shadow: 0 0 0 2px rgba(64, 64, 64, 0.04);
`;

export const ColorIndicator = styled(Indicator)`
  background: ${(props: { color: string }) => props.color};
`;

export const DashedIndicator = styled(Indicator)`
  background: ${(props: { color: string }) =>
    `repeating-linear-gradient(90deg, ${props.color}, ${props.color} 2px, #ffffff 2px, #ffffff 4px);`};
`;
