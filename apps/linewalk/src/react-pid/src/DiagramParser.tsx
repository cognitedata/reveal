import { useEffect, useReducer, useState } from 'react';

import { HandlerContainer } from './elements';
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

  const [loadStateFromCdf, setLoadStateFromCdf] = useState<boolean>(true);

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

  const toggleLoadStateFromCdf = () =>
    setLoadStateFromCdf((prevState) => !prevState);

  return (
    <HandlerContainer>
      <TopBar
        currentIndex={currentIndex}
        selectedExternalIds={selectedExternalIds}
        dispatch={dispatch}
        saveGraph={saveGraph}
        saveState={saveState}
        isAutoMode={isAutoMode}
        loadStateFromCdf={loadStateFromCdf}
        toggleLoadStateFromCdf={toggleLoadStateFromCdf}
      />
      <ReactPid
        isAutoMode={isAutoMode}
        key={diagramExternalId || 'no_diagram'}
        pidViewer={pidViewer}
        diagramExternalId={diagramExternalId}
        saveState={saveState}
        onAutoAnalysisCompleted={saveGraph}
        loadStateFromCDF={loadStateFromCdf}
      />
      {state.showList && (
        <DiagramList
          diagrams={diagrams}
          selectedUnparsedDiagrams={selectedExternalIds}
          dispatch={dispatch}
        />
      )}
    </HandlerContainer>
  );
};

export default DiagramParser;
