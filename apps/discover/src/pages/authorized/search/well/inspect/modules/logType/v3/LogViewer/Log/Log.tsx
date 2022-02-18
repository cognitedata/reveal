import React, { useRef, useState } from 'react';

import { DepthIndexTypeEnum } from '@cognite/sdk-wells-v3';
import { LogViewer } from '@cognite/videx-wellog';

import { useDeepEffect } from 'hooks/useDeep';
import { TrackType } from 'modules/wellSearch/types';

import { LogControllerWrapper } from './elements';
import { LogData, EventData } from './interfaces';
import { getTrackList } from './trackList/trackList';
import { getTrackScale } from './utils/getTrackScale';
import { updateRanges } from './utils/updateRanges';

export type Props = {
  displayTracks: TrackType[];
  logData: LogData;
  eventsData: EventData[];
  depthIndexColumnExternalId: string;
  depthIndexType: DepthIndexTypeEnum;
};

const Log: React.FC<Props> = ({
  displayTracks,
  logData,
  eventsData,
  depthIndexType,
  depthIndexColumnExternalId,
}) => {
  const logViewerRef = useRef<HTMLDivElement>(null);

  const [tracksState, setTracksState] = useState<any[]>([]);

  const updateLogViewer = () => {
    const logViewerContainer = logViewerRef.current;

    if (
      !logViewerContainer ||
      logViewerContainer.getElementsByClassName('overlay').length > 0
    )
      return;

    const { domain, scaleHandler } = getTrackScale({
      logData,
      depthIndexType,
      depthIndexColumnExternalId,
    });

    const logViewer = new LogViewer({
      showLegend: true,
      horizontal: false,
      domain,
      scaleHandler,
    });

    const tracks = getTrackList(displayTracks, logData, {}, eventsData);

    setTracksState(tracks);
    logViewer.init(logViewerContainer).setTracks(tracks).zoomTo(domain);
  };

  useDeepEffect(() => {
    updateLogViewer();
    updateRanges(logData, tracksState);
  }, [logData]);

  return (
    <LogControllerWrapper
      data-testid="log-controller-wrapper"
      ref={logViewerRef}
    />
  );
};

export default Log;
