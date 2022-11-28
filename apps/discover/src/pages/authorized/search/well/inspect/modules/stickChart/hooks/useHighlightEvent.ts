import { useDispatch } from 'react-redux';

import { wellInspectActions } from 'modules/wellInspect/actions';

import { EventType } from '../types';

import { useHighlightedEventsMap } from './useHighlightedEventsMap';

export const useHighlightEvent = (type: EventType) => {
  const dispatch = useDispatch();

  const highlightedEventsMap = useHighlightedEventsMap();

  const isEventHighlighted = (eventExternalId: string) => {
    return Boolean(highlightedEventsMap[type][eventExternalId]);
  };

  const toggleHighlightEvent = (eventExternalId: string) => {
    const isHighlighted = isEventHighlighted(eventExternalId);
    const nextHighlightedState = !isHighlighted;

    dispatch(
      wellInspectActions.stickChartHighlightEvent({
        type,
        eventExternalId,
        isHighlighted: nextHighlightedState,
      })
    );
  };

  return { isEventHighlighted, toggleHighlightEvent };
};
