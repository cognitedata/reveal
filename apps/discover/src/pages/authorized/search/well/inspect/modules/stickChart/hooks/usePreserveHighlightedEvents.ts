import { useEffect } from 'react';
import { batch, useDispatch } from 'react-redux';

import forEach from 'lodash/forEach';
import { BooleanMap } from 'utils/booleanMap';

import { storage } from '@cognite/storage';

import { wellInspectActions } from 'modules/wellInspect/actions';
import {
  useHighlightedNptMap,
  useHighlightedNdsMap,
} from 'modules/wellInspect/selectors';

import { EventType } from '../types';
import {
  EVENT_TYPES,
  HIGHLIGHTED_EVENTS_STORAGE_KEY,
} from '../WellboreStickChart/constants';

import { useHighlightedEventsMap } from './useHighlightedEventsMap';

export const usePreserveHighlightedEvents = () => {
  const dispatch = useDispatch();

  const highlightedNptMap = useHighlightedNptMap();
  const highlightedNdsMap = useHighlightedNdsMap();

  const highlightedEventsMap = useHighlightedEventsMap();

  useEffect(() => {
    const highlightedEventsMap = storage.getFromLocalStorage<
      Record<EventType, BooleanMap>
    >(HIGHLIGHTED_EVENTS_STORAGE_KEY);

    if (!highlightedEventsMap) {
      return;
    }

    batch(() => {
      EVENT_TYPES.forEach((type) => {
        forEach(
          highlightedEventsMap[type],
          (isHighlighted, eventExternalId) => {
            dispatch(
              wellInspectActions.stickChartHighlightEvent({
                type,
                eventExternalId,
                isHighlighted,
              })
            );
          }
        );
      });
    });
  }, []);

  useEffect(() => {
    storage.saveToLocalStorage(
      HIGHLIGHTED_EVENTS_STORAGE_KEY,
      highlightedEventsMap
    );
  }, [highlightedNptMap, highlightedNdsMap]);
};
