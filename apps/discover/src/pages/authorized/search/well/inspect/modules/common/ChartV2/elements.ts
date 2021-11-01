import styled from 'styled-components/macro';

import layers from '_helpers/zindex';
import { Flex, FlexColumn, FlexRow, sizes } from 'styles/layout';

export const ToolbarWrapper = styled.div`
  position: absolute;
  text-align: right;
  height: 28px;
  margin-top: ${sizes.normal};
  padding-right: ${sizes.normal};
  width: 100%;
`;

export const ChartWrapper = styled.div`
  min-height: 364px;
  position: relative;
  overflow: hidden !important;
  > .js-plotly-plot {
    min-height: 464px;
  }
  & > div {
    height: 100%;
    width: 100%;
    display: inline-block;
  }
  > * .main-svg {
    background: transparent !important;
  }

  > * .modebar-container {
    display: none;
  }

  > * .g-xtitle {
    transform: translateY(-22px);
  }

  > * .g-x2title {
    transform: translateY(20px);
  }

  > * .xy {
    .cursor-w-resize {
      width: calc(100% - 120px);
      cursor: ew-resize !important;
    }
    .cursor-e-resize {
      display: none;
    }
    .cursor-ew-resize {
      display: none;
    }
    .cursor-ns-resize {
      display: none;
    }
    .cursor-n-resize {
      height: calc(100% - 140px);
      cursor: ns-resize !important;
    }
    .cursor-s-resize {
      display: none;
    }
  }

  > * .x2y {
    .cursor-w-resize {
      transform: translateY(40px);
      width: calc(100% - 120px);
      cursor: ew-resize !important;
    }
    .cursor-e-resize {
      display: none;
    }
    .cursor-ew-resize {
      display: none;
    }
  }

  > * .x2y-x {
    transform: translateY(42px);
  }
  > * .ytitle,
  .xtitle,
  .x2title {
    fill: var(--cogs-greyscale-grey6) !important;
    font-family: Inter !important;
    font-weight: 500 !important;
    font-size: var(--cogs-o2-font-size) !important;
    line-height: ${sizes.normal} !important;
    letter-spacing: var(--cogs-micro-letter-spacing) !important;
  }

  > * .gtitle {
    fill: var(--cogs-greyscale-grey7) !important;
    font-family: Inter !important;
    font-weight: 500 !important;
    font-size: var(--cogs-o1-font-size) !important;
    line-height: var(--cogs-b2-line-height) !important;
  }

  > * .xtick,
  .x2tick,
  .ytick {
    text {
      fill: var(--cogs-greyscale-grey6) !important;
      font-family: Inter !important;
      font-weight: 500 !important;
      font-size: var(--cogs-o2-font-size) !important;
      line-height: ${sizes.normal} !important;
      letter-spacing: var(--cogs-micro-letter-spacing) !important;
    }
  }

  > * .crisp {
    stroke: var(--cogs-greyscale-grey4) !important;
  }

  > * .hovertext {
    display: none;
  }

  > * .hoverlayer {
    .legend {
      display: none;
    }
  }

  background-color: var(--cogs-greyscale-grey1);
`;

export const DetailcardWrapper = styled(FlexColumn)`
  position: absolute;
  height: auto !important;
  display: flex !important;
  width: auto !important;
  padding: ${sizes.small};
  background: var(--cogs-white);
  border: 2px solid rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  box-shadow: 0px 8px 16px 4px rgba(0, 0, 0, 0.04),
    0px 2px 12px rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  gap: ${sizes.small};
  z-index: ${layers.MAXIMUM};
  top: ${(props: { top: number }) => `${props.top}px`};
  left: ${(props: { left: number }) => `${props.left}px`};
  visibility: ${(props: { show: boolean }) =>
    props.show ? 'visible' : 'hidden'};
`;

export const DetailcardMainRow = styled(FlexRow)`
  padding: 8px 16px 8px 12px;
  background: var(--cogs-greyscale-grey1);
  border-radius: 8px;
  align-items: center;
  gap: 12px;
`;

export const DetailcardSubRow = styled(FlexRow)`
  gap: ${sizes.small};
`;

export const DetailcardBlock = styled(FlexColumn)`
  padding: 8px 16px 8px 12px;
  background: var(--cogs-greyscale-grey1);
  border-radius: 8px;
`;

export const DetailcardBlockFull = styled(DetailcardBlock)`
  flex: 1;
`;

export const DetailcardBlockHeader = styled(Flex)`
  font-weight: 500;
  font-size: var(--cogs-o1-font-size);
  line-height: var(--cogs-b2-line-height);
  letter-spacing: var(--cogs-b3-letter-spacing);
  color: var(--cogs-greyscale-grey9);
`;

export const DetailcardBlockContent = styled(Flex)`
  font-size: var(--cogs-b3-font-size);
  line-height: var(--cogs-b3-line-height);
  letter-spacing: -2.5e-5em;
  color: var(--cogs-greyscale-grey9);
`;
