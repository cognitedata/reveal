import { RefObject, useEffect, useState } from 'react';

export const usePlotRevision = (plotRef: RefObject<HTMLDivElement>) => {
  const [revision, setRevision] = useState<number>(0);

  useEffect(() => {
    const localPlotRef = plotRef.current;

    if (localPlotRef === null) {
      return undefined;
    }

    /**
     * Plotly doesn't correctly resize the graph when the parent element increases in height
     * before the user has started interacting with the element. Thus we use the revision
     * prop to force a redraw of the graph when the parent element changes size.
     */
    const resizeObserver = new ResizeObserver(() => {
      setRevision((prevRevision) => prevRevision + 1);
    });
    resizeObserver.observe(localPlotRef);

    return () => {
      resizeObserver.unobserve(localPlotRef);
    };
  }, [plotRef]);

  return revision;
};
