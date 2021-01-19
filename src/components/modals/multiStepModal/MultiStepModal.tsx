import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '@cognite/cogs.js';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { useDispatch, useSelector } from 'react-redux';
import { isErrorListEmpty, suiteState } from 'store/forms/selectors';
import { RootDispatcher } from 'store/types';
import { insertSuite } from 'store/suites/thunks';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import { ModalFooter } from 'components/modals/elements';
import { TS_FIX_ME } from 'types/core';
import { modalClose } from 'store/modals/actions';
import { ApiClientContext } from 'providers/ApiClientProvider';
import { useFormState } from 'hooks';
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
  const hasErrors = !useSelector(isErrorListEmpty) && !isValid;
  const { clearForm } = useFormState();

  const nextStep = () => {
    if (hasErrors) return;
    setStep('boards');
  };

  const handleCloseModal = () => {
    dispatch(modalClose());
    clearForm();
  };

  const handleSubmit = async () => {
    if (hasErrors) return;
    handleCloseModal();
    await dispatch(insertSuite(client, apiClient, suite));
    history.push(`/suites/${suite.key}`);
  };

  const Footer = () => {
    return (
      <ModalFooter>
        <Button variant="ghost" onClick={handleCloseModal}>
          Cancel
        </Button>
        <div>
          {isEqual(step, 'suite') && (
            <Button type="primary" onClick={nextStep} disabled={hasErrors}>
              {modalSettings.buttons[step].goToBoards}
            </Button>
          )}
          <Button type="secondary" onClick={handleSubmit}>
            {modalSettings.buttons.save}
          </Button>
        </div>
      </ModalFooter>
    );
  };
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
        {isEqual(step, 'boards') && <BoardForm />}
      </ModalContainer>
    </Modal>
  );
};
