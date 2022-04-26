import { Button, toast } from '@cognite/cogs.js';
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppState } from 'scarlet/hooks';
import { AppActionType } from 'scarlet/types';
import { getEquipmentProgress } from 'scarlet/utils';

import * as Styled from './style';

enum SaveState {
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error',
  NONE = 'none',
}

export const EquipmentStateBar = () => {
  const { equipment, saveState } = useAppState();
  const appDispatch = useAppDispatch();
  const [savingState, setSavingState] = useState<SaveState>(SaveState.NONE);
  const [isApproving, setIsApproving] = useState(false);

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

  const approve = () => {
    setIsApproving(true);
    appDispatch({ type: AppActionType.APPROVE_EQUIPMENT });
  };

  useEffect(() => {
    if (isApproving && !saveState.loading) {
      setIsApproving(false);

      if (saveState.error) {
        toast.error(`Failed to approve equipment`);
      } else {
        toast.success(`Equipment is approved`);
      }
    }
  }, [saveState.loading]);

  const progress = useMemo(
    () => getEquipmentProgress(equipment.data),
    [equipment.data]
  );

  if (progress === undefined) return null;

  const isReadyToApprove = progress === 100;

  return (
    <Styled.Container>
      <Styled.ProgressContainer progress={progress}>
        <Styled.ProgressLabel className="strong">{`${progress}% complete`}</Styled.ProgressLabel>
        <Styled.SaveState>
          {getSaveLabel(savingState, equipment.data!.isApproved)}
        </Styled.SaveState>
      </Styled.ProgressContainer>
      <Button
        type="primary"
        icon={isApproving ? 'Loader' : 'Checkmark'}
        iconPlacement="left"
        disabled={
          !isReadyToApprove || isApproving || equipment.data!.isApproved
        }
        onClick={approve}
      >
        Approve
      </Button>
    </Styled.Container>
  );
};

const getSaveLabel = (savingState: SaveState, isApproved = false) => {
  if (savingState === SaveState.SAVING) return 'Saving...';
  if (isApproved) return 'Approved';
  if (savingState === SaveState.SAVED) return 'Saved';
  if (savingState === SaveState.ERROR) return 'Failed to save';
  return null;
};
