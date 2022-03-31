import { useEffect, useReducer } from 'react';

import { HandlerContainer, HandlerContent } from './elements';
import { ReactPid } from './ReactPid';
import TopBar from './components/top-bar/TopBar';
import DiagramList from './components/diagram-list/DiagramList';
import diagramsReducer, {
  DiagramsReducerActionTypes,
  initialState,
} from './utils/diagramsReducer';
import useCdfDiagrams, { SaveState } from './utils/useCdfDiagrams';

const DiagramParser = () => {
  const [state, dispatch] = useReducer(diagramsReducer, initialState);
  const { selectedExternalIds, currentIndex, isAutoMode } = state;

  const { diagrams, pidViewer, saveGraph, saveState } = useCdfDiagrams();
  const diagramExternalId = selectedExternalIds[currentIndex];

  useEffect(() => {
    dispatch({
      type: DiagramsReducerActionTypes.SET_DIAGRAMS,
      diagrams,
    });
  }, [diagrams]);

  useEffect(() => {
    if (isAutoMode && saveState === SaveState.Saved) {
      dispatch({ type: DiagramsReducerActionTypes.NEXT });
    }
  }, [isAutoMode, saveState]);

  return (
    <HandlerContainer>
      <TopBar
        currentIndex={currentIndex}
        selectedExternalIds={selectedExternalIds}
        dispatch={dispatch}
        saveGraph={saveGraph}
        saveState={saveState}
        isAutoMode={isAutoMode}
      />
      <HandlerContent>
        <ReactPid
          isAutoMode={isAutoMode}
          key={diagramExternalId || 'no_diagram'}
          pidViewer={pidViewer}
          diagramExternalId={diagramExternalId}
          saveState={saveState}
          onAutoAnalysisCompleted={saveGraph}
        />
        {state.showList && (
          <DiagramList
            diagrams={diagrams}
            selectedUnparsedDiagrams={selectedExternalIds}
            dispatch={dispatch}
          />
        )}
      </HandlerContent>
    </HandlerContainer>
  );
};

export default DiagramParser;
