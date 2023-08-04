import styled from 'styled-components/macro';

import { INVERTED_LABEL_COLOR, LABEL_COLOR, TICK_COLOR } from '../../constants';
import { Variant } from '../../types';

interface PlotWrapperProps {
  showticks: boolean;
  cursor: string;
  variant?: Variant;
  inverted?: boolean;
}

export const PlotWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin-bottom: -4px;

  > * .main-svg {
    background: transparent !important;
  }

  & > div {
    height: 100%;
    width: 100%;
    display: inline-block;
  }

  > * .xtick,
  .ytick {
    text {
      fill: ${({ inverted }) =>
        inverted ? INVERTED_LABEL_COLOR : LABEL_COLOR} !important;
      font-family: Inter !important;
      font-weight: 400 !important;
      font-size: ${({ variant }: PlotWrapperProps) =>
        variant === 'small' ? 9.5 : 11}px !important;
      line-height: 16px !important;
      font-feature-settings: 'ss04' on !important;
    }
  }

  > * .xtick {
    transform: translateY(4px) !important;
  }

  > * .ytick {
    transform: translateX(-4px) !important;
  }

  > * .crisp {
    stroke: ${TICK_COLOR} !important;
    opacity: 0.5;
    ${({ showticks }: PlotWrapperProps) =>
      !showticks &&
      `
    display: none;
  `}
  }

  > * .draglayer {
    cursor: auto !important;
  }

  > * .nsewdrag {
    cursor: ${({ cursor }: PlotWrapperProps) => cursor} !important;
  }

  > * .xtitle,
  .ytitle {
    fill: ${LABEL_COLOR} !important;
    font-family: Inter !important;
    font-weight: 500 !important;
    font-size: ${({ variant }: PlotWrapperProps) =>
      variant === 'small' ? 10.5 : 12}px !important;
    line-height: 16px !important;
    font-feature-settings: 'ss04' on !important;
  }
`;
