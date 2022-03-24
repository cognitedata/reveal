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
  const diagrams = useCdfDiagrams();

  const { selectedExternalIds: selectedUnparsedDiagrams, currentIndex } = state;
  const diagramExternalId = selectedUnparsedDiagrams[currentIndex];

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
        selectedUnparsedDiagrams={selectedUnparsedDiagrams}
        dispatch={dispatch}
      />
      <HandlerContent>
        <ReactPid
          key={diagramExternalId ?? 'no_diagram'}
          diagramExternalId={diagramExternalId}
        />
        {state.showList && (
          <DiagramList
            diagrams={diagrams}
            selectedUnparsedDiagrams={selectedUnparsedDiagrams}
            dispatch={dispatch}
          />
        )}
      </HandlerContent>
    </HandlerContainer>
  );
};

export default DiagramParser;
