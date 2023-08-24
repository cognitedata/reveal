import { useCallback, useMemo, useState } from 'react';

import { IndustryCanvasState } from '../types';

import { EMPTY_FLEXIBLE_LAYOUT } from './constants';

type HistoryState = {
  history: IndustryCanvasState[];
  index: number;
};

export type UseCanvasStateHistoryReturnType = {
  historyState: HistoryState;
  pushState: (
    stateUpdaterFnOrState:
      | IndustryCanvasState
      | ((prevState: IndustryCanvasState) => IndustryCanvasState)
  ) => void;
  replaceState: (state: IndustryCanvasState) => void;
  undo: { fn: () => void; isDisabled: boolean };
  redo: { fn: () => void; isDisabled: boolean };
  canvasState: IndustryCanvasState;
};

const INITIAL_HISTORY_STATE: HistoryState = {
  history: [
    {
      container: EMPTY_FLEXIBLE_LAYOUT,
      canvasAnnotations: [],
      pinnedTimeseriesIdsByAnnotationId: {},
      liveSensorRulesByAnnotationIdByTimeseriesId: {},
    },
  ],
  index: 0,
};

export const useHistory = (): UseCanvasStateHistoryReturnType => {
  const [historyState, setHistoryState] = useState<HistoryState>(
    INITIAL_HISTORY_STATE
  );

  const pushState = useCallback(
    (
      stateUpdateOrFn:
        | IndustryCanvasState
        | ((state: IndustryCanvasState) => IndustryCanvasState)
    ) => {
      setHistoryState((prevHistoryState) => {
        const currentCanvasState =
          prevHistoryState.history[prevHistoryState.index];
        const nextHistoryIndex = prevHistoryState.index + 1;
        // TODO: Investigate whether we need to limit the history size
        const prevHistoryTruncated = prevHistoryState.history.slice(
          0,
          nextHistoryIndex
        );
        return {
          history: [
            ...prevHistoryTruncated,
            typeof stateUpdateOrFn === 'function'
              ? stateUpdateOrFn(currentCanvasState)
              : stateUpdateOrFn,
          ],
          index: nextHistoryIndex,
        };
      });
    },
    []
  );

  const replaceState = useCallback(
    (state: IndustryCanvasState) => {
      setHistoryState(() => ({
        history: [state],
        index: 0,
      }));
    },
    [setHistoryState]
  );

  const undoFn = useCallback(() => {
    const nextState = historyState.history[historyState.index - 1];
    if (nextState !== undefined) {
      setHistoryState({
        ...historyState,
        index: historyState.index - 1,
      });
    }
  }, [historyState]);

  const redoFn = useCallback(() => {
    const nextState = historyState.history[historyState.index + 1];
    if (nextState !== undefined) {
      setHistoryState({
        ...historyState,
        index: historyState.index + 1,
      });
    }
  }, [historyState]);

  const canvasState = useMemo(() => {
    return historyState.history[historyState.index];
  }, [historyState]);

  return {
    historyState,
    pushState,
    replaceState,
    undo: {
      fn: undoFn,
      isDisabled: historyState.index <= 0,
    },
    redo: {
      fn: redoFn,
      isDisabled: historyState.index >= historyState.history.length - 1,
    },
    canvasState,
  };
};
