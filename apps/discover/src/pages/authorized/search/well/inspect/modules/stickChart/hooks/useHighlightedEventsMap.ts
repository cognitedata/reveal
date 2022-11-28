import { BooleanMap } from 'utils/booleanMap';

import {
  useHighlightedNdsMap,
  useHighlightedNptMap,
} from 'modules/wellInspect/selectors';

import { EventType } from '../types';

export const useHighlightedEventsMap = (): Record<EventType, BooleanMap> => {
  const highlightedNptMap = useHighlightedNptMap();
  const highlightedNdsMap = useHighlightedNdsMap();

  return {
    npt: highlightedNptMap,
    nds: highlightedNdsMap,
  };
};
