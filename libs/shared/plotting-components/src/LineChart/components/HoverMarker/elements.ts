import styled from 'styled-components/macro';

import { HOVER_MARKER_SIZE } from '../../constants';

export const PlotMarker = styled.div`
  position: absolute;
  width: ${HOVER_MARKER_SIZE}px;
  height: ${HOVER_MARKER_SIZE}px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
`;
