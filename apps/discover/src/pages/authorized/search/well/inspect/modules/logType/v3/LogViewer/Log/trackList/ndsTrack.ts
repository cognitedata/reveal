import isEmpty from 'lodash/isEmpty';

import { scaleLegendConfig, BlockScaleTrack } from '@cognite/videx-wellog';

import { EventData } from '../interfaces';

const svgNS = 'http://www.w3.org/2000/svg';

const ELEMENT_CHECK_INTERVAL = 100;
const ELEMENT_MAX_WAIT = 5000;

const NDSTrack = (trackId: number, data: EventData[], unit: string) => {
  if (!data || data.length === 0) return null;

  const ndsTrack = new BlockScaleTrack(trackId, {
    maxWidth: 50,
    width: 2,
    label: 'NDS',
    units: unit,
    data,
    legendConfig: scaleLegendConfig,
  });

  // This is used to hide null events and append title for event blocks
  let checkCount = 0;
  const checkExist = setInterval(() => {
    if (checkCount >= ELEMENT_MAX_WAIT / ELEMENT_CHECK_INTERVAL) {
      // clear interval if its reached maximum wait time
      clearInterval(checkExist);
    } else if (ndsTrack.elm) {
      const majorTicks: HTMLCollectionOf<Element> =
        ndsTrack.elm.getElementsByClassName('major-tick');

      if (isEmpty(majorTicks)) return;

      for (let i = 0; i < majorTicks.length; i++) {
        if (ndsTrack.labels[i] === null || ndsTrack.labels[i] === undefined) {
          majorTicks[i].setAttribute('display', 'none');
        } else {
          const titleNode = document.createElementNS(svgNS, 'title');
          titleNode.innerHTML = ndsTrack.labels[i];
          majorTicks[i].setAttribute(
            'style',
            'pointer-events: auto;cursor: pointer;'
          );
          majorTicks[i].prepend(titleNode);
        }
      }
      clearInterval(checkExist);
    }
    checkCount += 1;
  }, ELEMENT_CHECK_INTERVAL);

  return ndsTrack;
};

export default NDSTrack;
