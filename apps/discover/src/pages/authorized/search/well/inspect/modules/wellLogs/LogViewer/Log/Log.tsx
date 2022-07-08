import React, { useRef, useState } from 'react';

import { DepthIndexTypeEnum } from '@cognite/sdk-wells';
import { LogViewer, Track } from '@cognite/videx-wellog';

import { useDeepEffect } from 'hooks/useDeep';

import { LogViewerWrapper } from './elements';
import { getLogViewerTracks } from './Tracks';
import { WellLogPreviewData, WellLogNdsEventsData } from './types';
import { getScaleHandler } from './utils/getScaleHandler';
import { updateRanges } from './utils/updateRanges';

export type Props = {
  logData: WellLogPreviewData;
  eventsData: WellLogNdsEventsData[];
  depthIndexColumnExternalId: string;
  depthIndexType: DepthIndexTypeEnum;
};

const Log: React.FC<Props> = ({
  logData,
  eventsData,
  depthIndexType,
  depthIndexColumnExternalId,
}) => {
  const logViewerRef = useRef<HTMLDivElement>(null);

  const [tracksState, setTracksState] = useState<Track[]>([]);

  const updateLogViewer = () => {
    const logViewerContainer = logViewerRef.current;

    if (
      !logViewerContainer ||
      logViewerContainer.getElementsByClassName('overlay').length > 0
    )
      return;

    const { domain, unit: depthUnit } = logData[depthIndexColumnExternalId];

    const scaleHandler = getScaleHandler({
      logData,
      domain,
      depthIndexType,
    });

    const logViewer = new LogViewer({
      showLegend: true,
      horizontal: false,
      domain,
      scaleHandler,
    });

    const tracks = getLogViewerTracks({ logData, eventsData, depthUnit });

    setTracksState(tracks);
    logViewer.init(logViewerContainer).setTracks(tracks).zoomTo(domain);
  };

  useDeepEffect(() => {
    updateLogViewer();
    updateRanges(logData, tracksState);
  }, [logData]);

  return (
    <LogViewerWrapper data-testid="log-viewer-wrapper" ref={logViewerRef} />
  );
};

export default Log;
