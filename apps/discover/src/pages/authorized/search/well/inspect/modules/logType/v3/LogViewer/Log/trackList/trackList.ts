import { TrackType } from 'modules/wellSearch/types';

import { LogData, EventData } from '../interfaces';

import FRMTrack from './frmTrack';
import GraphTrackConfig from './graphTrack';
import MDTrack from './mdTrack';
import NDSTrack from './ndsTrack';
import TVDTrack from './tvdTrack';

// This returns track list
export const getTrackList = (
  displayTracks: TrackType[],
  logData: LogData,
  logFrmTopsData: LogData,
  eventData: EventData[]
) => {
  const trackList: any[] = [];

  displayTracks.forEach((displayTrack) => {
    switch (displayTrack) {
      case 'MD': {
        const mdTrack = MDTrack(trackList.length, logData);
        if (mdTrack) {
          trackList.push(mdTrack);
        }
        break;
      }
      case 'TVD': {
        const tvdTrack = TVDTrack(trackList.length, logData);
        if (tvdTrack) {
          trackList.push(tvdTrack);
        }
        break;
      }
      case 'FRM': {
        const frmTrack = FRMTrack(trackList.length, logFrmTopsData);
        if (frmTrack) {
          trackList.push(frmTrack);
        }
        break;
      }
      case 'NDS': {
        const ndsTrack = NDSTrack(
          trackList.length,
          eventData,
          logData.MD?.unit || logData.TVD?.unit || 'feet'
        );
        if (ndsTrack) {
          trackList.push(ndsTrack);
        }
        break;
      }
      default: {
        const graphTrack = GraphTrackConfig(
          trackList.length,
          displayTrack,
          logData
        );
        if (graphTrack) {
          trackList.push(graphTrack);
        }
      }
    }
  });

  return trackList;
};
