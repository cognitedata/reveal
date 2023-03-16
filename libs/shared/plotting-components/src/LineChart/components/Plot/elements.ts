import styled from 'styled-components/macro';

import { LABEL_COLOR, TICK_COLOR } from '../../constants';
import { Variant } from '../../types';

interface PlotWrapperProps {
  showticks: boolean;
  cursor: string;
  variant?: Variant;
  showyticklabels?: boolean;
}

export const PlotWrapper = styled.div`
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
      fill: ${LABEL_COLOR} !important;
      font-family: Inter !important;
      font-weight: 400 !important;
      font-size: ${({ variant }: PlotWrapperProps) =>
        variant === 'small' ? 9.5 : 11}px !important;
      line-height: 16px !important;
      font-feature-settings: 'ss04' on !important;
    }
  }

  ${({ showyticklabels }: PlotWrapperProps) =>
    showyticklabels &&
    `
    > * .xtick:first-child {
      display: none;
    }
  `}

  > * .crisp {
    stroke: ${TICK_COLOR} !important;
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
