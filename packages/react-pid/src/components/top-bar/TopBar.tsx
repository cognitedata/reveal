import { Button } from '@cognite/cogs.js';
import { Dispatch } from 'react';

import {
  DiagramsReducerAction,
  DiagramsReducerActionTypes,
} from '../../utils/diagramsReducer';

import { Left, Right, TopBarContainer } from './elements';

interface TopBarProps {
  currentIndex: number;
  selectedUnparsedDiagrams: string[];
  dispatch: Dispatch<DiagramsReducerAction>;
}

const TopBar = ({
  currentIndex,
  selectedUnparsedDiagrams,
  dispatch,
}: TopBarProps) => {
  const showDiagramList = () => {
    dispatch({ type: DiagramsReducerActionTypes.TOGGLE_SHOW_LIST });
  };
  const previous = () => {
    dispatch({ type: DiagramsReducerActionTypes.PREVIOUS });
  };
  const next = () => {
    dispatch({ type: DiagramsReducerActionTypes.NEXT });
  };

  return (
    <TopBarContainer>
      <Left>
        <Button icon="Upload" onClick={showDiagramList}>
          Select file(s)
        </Button>
        <Button
          icon="PushLeft"
          disabled={currentIndex < 1}
          onClick={previous}
        />
        {selectedUnparsedDiagrams.length > 0 && (
          <span>
            {currentIndex + 1}/{selectedUnparsedDiagrams.length}
          </span>
        )}
        <Button
          icon="PushRight"
          disabled={currentIndex >= selectedUnparsedDiagrams.length - 1}
          onClick={next}
        />
      </Left>
      <Right>
        <Button icon="OutputData" disabled>
          Process all files
        </Button>
        <Button icon="Upload" disabled>
          Save
        </Button>
      </Right>
    </TopBarContainer>
  );
};

export default TopBar;
