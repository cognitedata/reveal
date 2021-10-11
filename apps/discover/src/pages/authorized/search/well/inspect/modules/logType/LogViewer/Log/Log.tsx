import { FC, useEffect, useState } from 'react';

import { LogViewer } from '@cognite/videx-wellog';

import { TrackType } from 'modules/wellSearch/types';

import { getScaleHandler } from '../utils';

import { LogControllerWrapper } from './elements';
import { LogData, EventData } from './interfaces';
import { getTrackList } from './trackList/trackList';
import {
  addFrmRulers,
  viewFrmRulers,
  disableEmptyLegends,
  updateRanges,
} from './utils';

export type Props = {
  displayTracks: TrackType[];
  logData: LogData;
  logFrmTopsData: LogData;
  selectedMarkers: string[];
  eventData: EventData[];
};

/**
 * This component is used to visualize log
 */
const Log: FC<Props> = ({
  displayTracks,
  logData,
  logFrmTopsData,
  eventData,
  selectedMarkers,
}) => {
  let container: any = null;
  const [tracksState, setTracksState] = useState<any[]>([]);

  const updateLogViewer = () => {
    if (container.getElementsByClassName('overlay').length > 0) return;

    const { scaleHandler, domain } = getScaleHandler(logData);

    // Initializing log controller object
    const logController = new LogViewer({
      showLegend: true,
      horizontal: false,
      domain,
    });

    // Get track list
    const tracks = getTrackList(
      displayTracks,
      logData,
      logFrmTopsData,
      eventData
    );
    setTracksState(tracks);
    logController.init(container).setTracks(tracks).zoomTo(domain);

    addFrmRulers(logController);

    disableEmptyLegends(container);

    if (scaleHandler) {
      logController.scaleHandler = scaleHandler;
    }
  };

  useEffect(() => {
    updateLogViewer();
  }, [logData, logFrmTopsData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update curve ranges on domain changes
  useEffect(() => {
    updateRanges(logData, tracksState);
  }, [logData]);

  useEffect(() => {
    viewFrmRulers(container, selectedMarkers);
  }, [selectedMarkers]);

  return (
    <LogControllerWrapper
      data-testid="log-controller-wrapper"
      ref={(el: HTMLDivElement | null) => {
        container = el;
      }}
    />
  );
};

export default Log;
