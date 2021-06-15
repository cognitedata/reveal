import React, { useEffect } from 'react';
import { modalSettings } from 'components/modals/config';
import { useFormState } from 'hooks';
import { Suite } from 'store/suites/types';
import { MultiStepModal } from '../multiStepModal/MultiStepModal';

interface Props {
  suite: Suite;
}

const EditSuiteModal: React.FC<Props> = ({ suite }: Props) => {
  const { initForm } = useFormState();

  useEffect(() => {
    initForm(suite);
  }, [initForm, suite]);

  return <MultiStepModal modalSettings={modalSettings.edit} />;
};

export default EditSuiteModal;
