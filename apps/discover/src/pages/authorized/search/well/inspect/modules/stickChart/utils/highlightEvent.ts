import isEmpty from 'lodash/isEmpty';
import pickBy from 'lodash/pickBy';
import { BooleanMap } from 'utils/booleanMap';
import { serializeParams } from 'utils/url';

import { URL_KEY } from 'constants/url';

import { EventType } from '../types';
import { EVENT_TYPES } from '../WellboreStickChart/constants';

export const HIGHLIGHT_EVENT_URL_KEY_MAP: Record<EventType, string> = {
  npt: URL_KEY.HIGHLIGHTED_NPT,
  nds: URL_KEY.HIGHLIGHTED_NDS,
};

export const serializeHighlightedEvents = (
  highlightedEventsMap: Record<EventType, BooleanMap>
) => {
  const params = EVENT_TYPES.reduce((result, type) => {
    const urlKey = HIGHLIGHT_EVENT_URL_KEY_MAP[type];
    const highlightedEvents = Object.keys(pickBy(highlightedEventsMap[type]));

    if (isEmpty(highlightedEvents)) {
      return result;
    }

    return {
      ...result,
      [urlKey]: highlightedEvents.join(','),
    };
  }, {} as Record<EventType, string>);

  return serializeParams(params);
};
