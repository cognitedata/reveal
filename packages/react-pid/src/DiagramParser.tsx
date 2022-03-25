import { useEffect, useReducer } from 'react';

import { HandlerContainer, HandlerContent } from './elements';
import { ReactPid } from './ReactPid';
import TopBar from './components/top-bar/TopBar';
import DiagramList from './components/diagram-list/DiagramList';
import diagramsReducer, {
  DiagramsReducerActionTypes,
  initialState,
} from './utils/diagramsReducer';
import useCdfDiagrams from './utils/useCdfDiagrams';

const DiagramParser = () => {
  const [state, dispatch] = useReducer(diagramsReducer, initialState);
  const { diagrams, pidViewer, saveGraph, saveState } = useCdfDiagrams();

  const { selectedExternalIds, currentIndex } = state;
  const diagramExternalId = selectedExternalIds[currentIndex];

  useEffect(() => {
    dispatch({
      type: DiagramsReducerActionTypes.SET_DIAGRAMS,
      diagrams,
    });
  }, [diagrams]);

  return (
    <HandlerContainer>
      <TopBar
        currentIndex={currentIndex}
        selectedUnparsedDiagrams={selectedExternalIds}
        dispatch={dispatch}
        saveGraph={saveGraph}
        saveState={saveState}
      />
      <HandlerContent>
        <ReactPid
          key={diagramExternalId ?? 'no_diagram'}
          pidViewer={pidViewer}
          diagramExternalId={diagramExternalId}
          saveState={saveState}
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
