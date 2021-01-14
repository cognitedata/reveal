import React, { useEffect } from 'react';
import { modalSettings } from 'components/modals/config';
import { useFormState } from 'hooks';
import { Suite } from 'store/suites/types';
import { MultiStepModal } from '../multiStepModal/MultiStepModal';

interface Props {
  dataItem: Suite;
}

const EditSuiteModal: React.FC<Props> = ({ dataItem }: Props) => {
  const { initForm } = useFormState();

  useEffect(() => {
    initForm(dataItem, dataItem?.boards[0] || {});
  }, [initForm, dataItem]);

  return <MultiStepModal modalSettings={modalSettings.edit} />;
};

export default EditSuiteModal;
