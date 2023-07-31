import * as React from 'react';

import { InfoViewerWrapper } from './elements';

interface Props {
  position: number[];
  x: number;
  y: number;
  trace: number;
  amplitude: number | string;
}

export const InfoViewer: React.FC<Props> = (props) => {
  const { position, x, y, trace, amplitude } = props;

  return (
    <InfoViewerWrapper position={position}>
      <div>X : {x}</div>
      <div>Y : {y}</div>
      <div>Z : N/A</div>
      <div>Trace : {trace}</div>
      <div>Amplitude : {amplitude}</div>
    </InfoViewerWrapper>
  );
};

export default InfoViewer;
