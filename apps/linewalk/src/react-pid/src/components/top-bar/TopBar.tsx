import { Button, ButtonProps, Switch } from '@cognite/cogs.js';
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
        <Button {...buttonProps} type="ghost" icon="Loader" disabled>
          Saving
        </Button>
      );
    default:
      return (
        <Button
          {...buttonProps}
          icon="Upload"
          disabled={saveState === SaveState.Computing}
        >
          Save
        </Button>
      );
  }
};

interface TopBarProps {
  currentIndex: number;
  selectedExternalIds: string[];
  dispatch: Dispatch<DiagramsReducerAction>;
  saveGraph: () => void;
  saveState: SaveState;
  isAutoMode: boolean;
  loadStateFromCdf: boolean;
  toggleLoadStateFromCdf: () => void;
}

const TopBar = ({
  currentIndex,
  selectedExternalIds,
  dispatch,
  saveGraph,
  saveState,
  isAutoMode,
  loadStateFromCdf,
  toggleLoadStateFromCdf,
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
  const toggleAutoMode = () => {
    dispatch({ type: DiagramsReducerActionTypes.TOGGLE_AUTO_MODE });
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
        {selectedExternalIds.length > 0 && (
          <span>
            {currentIndex + 1}/{selectedExternalIds.length}
          </span>
        )}
        <Button
          icon="PushRight"
          disabled={currentIndex >= selectedExternalIds.length - 1}
          onClick={next}
        />
      </Left>
      <Right>
        <Switch
          name="Load state from CDF"
          checked={loadStateFromCdf}
          onChange={toggleLoadStateFromCdf}
        >
          Load state from CDF
        </Switch>
        <Button
          icon="OutputData"
          onClick={toggleAutoMode}
          toggled={isAutoMode}
          disabled={selectedExternalIds.length < 1}
        >
          Process all files
        </Button>
        <SaveButton
          saveState={saveState}
          disabled={selectedExternalIds.length < 1}
          onClick={saveGraph}
        />
      </Right>
    </TopBarContainer>
  );
};

export default TopBar;
