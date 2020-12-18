import React from 'react';
import { modalSettings } from 'components/modals/config';
import { TS_FIX_ME } from 'types/core';
import { useFormState } from 'hooks/useFormState';
import { MultiStepModal } from '../multiStepModal/MultiStepModal';

interface Props {
  dataItem: TS_FIX_ME;
}

const EditSuiteModal: React.FC<Props> = ({ dataItem }: Props) => {
  const { suite, setSuite, board, setBoard } = useFormState(
    dataItem?.boards[0] || {},
    dataItem
  );

  return (
    <MultiStepModal
      suite={suite}
      board={board}
      setSuite={setSuite}
      setBoard={setBoard}
      modalSettings={modalSettings.edit}
    />
  );
};

export default EditSuiteModal;
