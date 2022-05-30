import React, { useState } from 'react';

import usePanning from '../../utils/usePanning';
import { ZoomControls } from '../zoom-controls/ZoomControls';

export const CONTAINER_ID = 'container';

type Props = {
  hasDocumentLoaded: boolean;
  documentWidth: number;
  documentHeight: number;
};

const SvgContainer: React.FC<Props> = ({
  documentWidth,
  documentHeight,
  hasDocumentLoaded,
}) => {
  const [outerSvgRef, setOuterSvgRef] = useState<SVGSVGElement | null>(null);

  const { transform, zoomIn, zoomOut, resetZoom } = usePanning(
    outerSvgRef,
    {
      width: documentWidth,
      height: documentHeight,
    },
    hasDocumentLoaded
  );

  return (
    <>
      <svg
        style={{
          width: '100%',
          height: '100%',
        }}
        tabIndex={0}
        ref={(ref) => setOuterSvgRef(ref)}
      >
        <g id={CONTAINER_ID} transform={transform} />
      </svg>
      <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetZoom} />
    </>
  );
};

export default SvgContainer;
