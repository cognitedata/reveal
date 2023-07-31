import { useEffect, useMemo, useState } from 'react';
import { useAppState } from 'hooks';
import { getEquipmentProgress } from 'utils';

import * as Styled from './style';

enum SaveState {
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error',
  NONE = 'none',
}

export const EquipmentStateBar = () => {
  const { equipment, saveState } = useAppState();
  const [savingState, setSavingState] = useState<SaveState>(SaveState.NONE);

  useEffect(() => {
    if (saveState.loading) {
      setSavingState(SaveState.SAVING);
      return undefined;
    }

    if (!saveState.error) {
      setSavingState((state) =>
        state === SaveState.SAVING ? SaveState.SAVED : SaveState.NONE
      );
    } else {
      setSavingState(SaveState.ERROR);
    }

    const timeoutToClearSavingState = setTimeout(
      () => setSavingState(SaveState.NONE),
      5000
    );

    return () => clearTimeout(timeoutToClearSavingState);
  }, [saveState.loading]);

  const progress = useMemo(
    () => getEquipmentProgress(equipment.data),
    [equipment.data]
  );

  if (progress === undefined) return null;

  return (
    <Styled.Container>
      <Styled.ProgressContainer progress={progress}>
        <Styled.ProgressLabel className="strong">{`${progress}% complete`}</Styled.ProgressLabel>
        <Styled.SaveState>{getSaveLabel(savingState)}</Styled.SaveState>
      </Styled.ProgressContainer>
    </Styled.Container>
  );
};

const getSaveLabel = (savingState: SaveState) => {
  if (savingState === SaveState.SAVING) return 'Saving...';
  if (savingState === SaveState.SAVED) return 'Saved';
  if (savingState === SaveState.ERROR) return 'Failed to save';
  return null;
};
