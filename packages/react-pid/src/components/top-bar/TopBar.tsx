import { Button, ButtonProps } from '@cognite/cogs.js';
import { Dispatch } from 'react';

import {
  DiagramsReducerAction,
  DiagramsReducerActionTypes,
} from '../../utils/diagramsReducer';
import { SaveState } from '../../utils/useCdfDiagrams';

import { Left, Right, TopBarContainer } from './elements';

interface SaveButtonProps extends ButtonProps {
  saveState: SaveState;
}

const SaveButton = ({ saveState, ...buttonProps }: SaveButtonProps) => {
  switch (saveState) {
    case SaveState.Error:
      return (
        <Button {...buttonProps} type="danger" icon="Warning">
          Try again
        </Button>
      );
    case SaveState.Saving:
      return (
        <Button {...buttonProps} type="ghost" icon="Loader">
          Saving
        </Button>
      );
    default:
      return (
        <Button {...buttonProps} icon="Upload">
          Save
        </Button>
      );
  }
};

interface TopBarProps {
  currentIndex: number;
  selectedUnparsedDiagrams: string[];
  dispatch: Dispatch<DiagramsReducerAction>;
  saveGraph: () => void;
  saveState: SaveState;
}

const TopBar = ({
  currentIndex,
  selectedUnparsedDiagrams,
  dispatch,
  saveGraph,
  saveState,
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
        <Button icon="Download" onClick={showDiagramList}>
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
        <SaveButton
          saveState={saveState}
          disabled={selectedUnparsedDiagrams.length < 1}
          onClick={saveGraph}
        />
      </Right>
    </TopBarContainer>
  );
};

export default TopBar;
