import React from 'react';
import { modalSettings } from 'components/modals/config';
import { suiteEmpty } from 'components/modals/utils';
import { useFormState } from 'hooks/useForm';
import { Board } from 'store/suites/types';
import { MultiStepModal } from '../multiStepModal/MultiStepModal';

const CreateSuiteModal: React.FC = () => {
  const { suite, setSuite, board, setBoard } = useFormState(
    {} as Board,
    suiteEmpty
  );

  return (
    <MultiStepModal
      suite={suite}
      board={board}
      setSuite={setSuite}
      setBoard={setBoard}
      modalSettings={modalSettings.create}
    />
  );
};

export default CreateSuiteModal;
