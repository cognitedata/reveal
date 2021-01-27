import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Icon } from '@cognite/cogs.js';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { useDispatch, useSelector } from 'react-redux';
import { formState, isErrorListEmpty, suiteState } from 'store/forms/selectors';
import { RootDispatcher } from 'store/types';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import { ModalFooter } from 'components/modals/elements';
import { TS_FIX_ME } from 'types/core';
import { modalClose } from 'store/modals/actions';
import { ApiClientContext } from 'providers/ApiClientProvider';
import { useFormState } from 'hooks';
import { saveForm } from 'store/forms/thunks';
import { BoardForm, SuiteForm } from './steps';
import Modal from '../simpleModal/Modal';
import { ModalContainer } from '../elements';

type Step = 'suite' | 'boards';

interface Props {
  modalSettings: TS_FIX_ME;
}

export const MultiStepModal: React.FC<Props> = ({ modalSettings }: Props) => {
  const client = useContext(CdfClientContext);
  const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();
  const [step, setStep] = useState<Step>('suite');
  const history = useHistory();
  const suite = useSelector(suiteState);
  const isValid = !isEmpty(suite.title);
  const hasErrors = !useSelector(isErrorListEmpty) || !isValid;
  const { clearForm } = useFormState();
  const { saving: formSaving } = useSelector(formState);
  const [filesUploadQueue] = useState(new Map());

  const nextStep = () => {
    if (hasErrors) return;
    setStep('boards');
  };

  const handleCloseModal = () => {
    dispatch(modalClose());
    clearForm();
    filesUploadQueue.clear();
  };

  const handleSubmit = async () => {
    if (hasErrors) return;

    await dispatch(saveForm(client, apiClient, filesUploadQueue, suite));

    handleCloseModal();
    history.push(`/suites/${suite.key}`);
  };
 
  const Footer = () => (
    <ModalFooter>
      <Button variant="ghost" onClick={handleCloseModal} disabled={formSaving}>
        Cancel
      </Button>
      <div>
        {isEqual(step, 'suite') && (
          <Button
            type="primary"
            onClick={nextStep}
            disabled={hasErrors || formSaving}
          >
            {modalSettings.buttons[step].goToBoards}
          </Button>
        )}
        {formSaving ? (
          <Icon type="Loading" />
        ) : (
          <Button
            type="secondary"
            onClick={handleSubmit}
            disabled={hasErrors || formSaving}
          >
            {modalSettings.buttons.save}
          </Button>
        )}
      </div>
    </ModalFooter>
  );
  return (
    <Modal
      visible
      onCancel={handleCloseModal}
      headerText={modalSettings.header[step]}
      width={modalSettings.width[step]}
      footer={<Footer />}
    >
      <ModalContainer>
        {isEqual(step, 'suite') && <SuiteForm />}
        {isEqual(step, 'boards') && (
          <BoardForm filesUploadQueue={filesUploadQueue} />
        )}
      </ModalContainer>
    </Modal>
  );
};
