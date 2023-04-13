import { cloneDeep } from 'lodash';
import { useCallback, useState } from 'react';
import { IndustryCanvasState } from '../types';

type HistoryState = {
  history: IndustryCanvasState[];
  index: number;
};

export type UseCanvasStateHistoryReturnType = {
  historyState: HistoryState;
  pushState: (state: IndustryCanvasState) => void;
  replaceState: (state: IndustryCanvasState) => void;
  clearState: () => void;
  undo: { fn: () => void; isDisabled: boolean };
  redo: { fn: () => void; isDisabled: boolean };
};

type UseCanvasStateHistoryProps = {
  saveState: (state: IndustryCanvasState) => Promise<void>;
};

const INITIAL_HISTORY_STATE: HistoryState = {
  history: [
    {
      containerReferences: [],
      canvasAnnotations: [],
    },
  ],
  index: 0,
};

export const useHistory = ({
  saveState,
}: UseCanvasStateHistoryProps): UseCanvasStateHistoryReturnType => {
  const [historyState, setHistoryState] = useState<HistoryState>(
    INITIAL_HISTORY_STATE
  );

  const pushState = useCallback(
    (state: IndustryCanvasState) => {
      const nextCanvasState = cloneDeep(state);

      setHistoryState((prevHistoryState) => {
        const nextHistoryIndex = prevHistoryState.index + 1;
        // TODO: Investigate whether we need to limit the history size
        const prevHistoryTruncated = prevHistoryState.history.slice(
          0,
          nextHistoryIndex
        );
        return {
          history: [...prevHistoryTruncated, nextCanvasState],
          index: nextHistoryIndex,
        };
      });

      saveState(nextCanvasState);
    },
    [saveState]
  );

  const replaceState = useCallback(
    (state: IndustryCanvasState) => {
      setHistoryState((prevHistoryState) => {
        const nextHistory = [...prevHistoryState.history];
        nextHistory[prevHistoryState.index] = state;
        return {
          history: nextHistory,
          index: prevHistoryState.index,
        };
      });
    },
    [setHistoryState]
  );

  const clearState = useCallback(
    () => setHistoryState(INITIAL_HISTORY_STATE),
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

  return {
    historyState,
    pushState,
    replaceState,
    clearState,
    undo: {
      fn: undoFn,
      isDisabled: historyState.index <= 0,
    },
    redo: {
      fn: redoFn,
      isDisabled: historyState.index >= historyState.history.length - 1,
    },
  };
};
