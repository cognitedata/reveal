import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { sizes } from 'styles/layout';

export const AppFrame = styled.div`
  z-index: ${layers.APP_FRAME};
  width: 100%;
  max-height: 100vh;
  height: 100vh;
  flex: 1;
  overflow: hidden;

  .horizontal-resizer {
    position: relative;
    flex: 1;
    height: 100% !important;
  }
`;

export const BetaSymbol = styled.span`
  width: 9px;
  font-family: Inter;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  color: var(--cogs-red-2);
  margin-top: -${sizes.normal};
  position: relative;
  top: -0.5em;
  padding-left: ${sizes.extraSmall};

  &:after {
    content: '\u03B2';
  }
`;
