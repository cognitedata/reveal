import { Button, toast } from '@cognite/cogs.js';
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppState } from 'scarlet/hooks';
import { AppActionType, DataElementState } from 'scarlet/types';

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

  const progress = useMemo(() => {
    if (!equipment.data) return undefined;
    let total = 0;
    let completed = 0;
    total += equipment.data.equipmentElements.length;
    completed += equipment.data.equipmentElements.filter(
      (dataElement) => dataElement.state !== DataElementState.PENDING
    ).length;

    if (!equipment.data.components.length) {
      total *= 2;
    } else {
      equipment.data.components.forEach((component) => {
        total += component.componentElements.length;
        completed += component.componentElements.filter(
          (dataElement) => dataElement.state !== DataElementState.PENDING
        ).length;
      });
    }

    const result = total ? (completed / total) * 100 : 0;
    return result < 50 ? Math.ceil(result) : Math.floor(result);
  }, [equipment.data]);

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
