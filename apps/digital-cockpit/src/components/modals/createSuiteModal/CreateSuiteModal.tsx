import React, { useEffect } from 'react';
import { modalSettings } from 'components/modals/config';
import { useFormState } from 'hooks';
import { getEmptySuite } from 'utils/forms';
import { getNextSuiteOrder } from 'store/suites/selectors';
import { useSelector } from 'react-redux';
import { MultiStepModal } from '../multiStepModal/MultiStepModal';

const CreateSuiteModal: React.FC = () => {
  const { initForm } = useFormState();

  const nextSuiteOrder = useSelector(getNextSuiteOrder);

  const emptySuite = getEmptySuite(nextSuiteOrder);

  useEffect(() => {
    initForm(emptySuite);
  }, [initForm, emptySuite]);

  return <MultiStepModal modalSettings={modalSettings.create} />;
};

export default CreateSuiteModal;
