import { useEffect } from 'react';

import without from 'lodash/without';
import { useSetUrlParams } from 'utils/url/setUrlParams';

import { URL_KEY } from 'constants/url';
import {
  useHighlightedNptMap,
  useHighlightedNdsMap,
} from 'modules/wellInspect/selectors';

import {
  HIGHLIGHT_EVENT_URL_KEY_MAP,
  serializeHighlightedEvents,
} from '../utils/highlightEvent';

import { useHighlightedEventsMap } from './useHighlightedEventsMap';

const preserveKeys = without(
  Object.values(URL_KEY),
  ...Object.values(HIGHLIGHT_EVENT_URL_KEY_MAP)
);

export const useUpdateHighlightedEventsUrlParams = () => {
  const highlightedNptMap = useHighlightedNptMap();
  const highlightedNdsMap = useHighlightedNdsMap();

  const highlightedEventsMap = useHighlightedEventsMap();

  const setUrlParams = useSetUrlParams();

  useEffect(() => {
    const params = serializeHighlightedEvents(highlightedEventsMap);
    setUrlParams(params, { preserveKeys });
  }, [highlightedNptMap, highlightedNdsMap]);
};
