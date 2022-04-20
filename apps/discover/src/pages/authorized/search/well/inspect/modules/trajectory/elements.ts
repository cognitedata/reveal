import styled from 'styled-components/macro';

import { sizes } from 'styles/layout';

export const TrajectoryGrid = styled.div`
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(3, 1fr);
  background-color: var(--cogs-white);
  border-top: 1px solid var(--cogs-black);
  border-left: 1px solid var(--cogs-black);
  border-radius: ${sizes.small};

  & .chart2d {
    border-bottom: 1px solid var(--cogs-black);
    border-right: 1px solid var(--cogs-black);
  }

  // access first child of the first row
  .chart2d :first-child {
    border-top-left-radius: ${sizes.small};
    overflow: hidden;
  }

  // access last child of the first row
  .chart2d :nth-child(3n) {
    border-top-right-radius: ${sizes.small};
    overflow: hidden;
  }

  // access first child of last row
  .chart2d :nth-child(3n + 1):nth-last-child(-n + 3) {
    border-bottom-left-radius: ${sizes.small};
    overflow: hidden;
  }

  & .legend {
    border-bottom: 1px solid var(--cogs-black);
    border-right: 1px solid var(--cogs-black);

    & .cartesianlayer,
    .legendtoggle,
    .xy {
      max-width: 0px;
      display: none;
      pointer-events: none !important;
      opacity: 0.7;
      border-right: 1px solid var(--cogs-black);
    }

    & .g-xtitle {
      display: none;
    }
    & .g-ytitle {
      display: none;
    }
    & .modebar {
      display: none;
    }
  }

  // access last child of last row
  .legend :last-child {
    overflow: hidden;
    border-bottom-right-radius: ${sizes.small};
  }
`;

export const TrajectoryChildGrid = styled.div`
  display: grid;
`;

export const FullSizedTrajectoryView = styled(TrajectoryGrid)`
  border: 1px solid var(--cogs-black);
  grid-template-columns: repeat(1, 1fr);

  .chart2d {
    border: none;
  }
`;
