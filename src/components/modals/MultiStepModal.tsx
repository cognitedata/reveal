import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { useDispatch } from 'react-redux';
import { RootDispatcher } from 'store/types';
import { insertSuite } from 'store/suites/thunks';
import { Button } from '@cognite/cogs.js';
import Modal from './Modal';
import { CreateSuite, AddBoard, ManageAccess } from './steps';
import { ModalContainer } from './elements';

interface Props {
  buttonText: string;
}

const key = `_${Math.random().toString(36).substr(2, 9)}`;
const dashboard: any = { key: '', type: '', title: '', url: '', embedTag: '' };

const suite: any = {
  key,
  columns: {
    title: '',
    description: '',
    color: '#F4DAF8',
    dashboards: [],
  },
};
export const MultiStepModal: React.FC<Props> = ({ buttonText }: Props) => {
  const client = useContext(CdfClientContext);
  const dispatch = useDispatch<RootDispatcher>();
  const [newSuite, setNewSuite] = useState(suite);
  const [modalHeader, setModalHeader] = useState<string>('Create a new suite');
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const history = useHistory();

  useEffect(() => {
    const headers = [
      'Create a new suite',
      'Add board to suite',
      'Manage access to suite',
    ];
    setModalHeader(headers[step]);
  }, [step]);

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCLoseModal = () => {
    setIsOpen(false);
  };

  const handleSubmit = async () => {
    await dispatch(insertSuite(client, [newSuite]));
    history.push(`/suites/${newSuite.key}`);
  };

  const handleSuiteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    suite.columns[event.target.name] = event.target.value;
    setNewSuite(suite);
  };

  const handleDashboardChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    dashboard[event.target.name] = event.target.value;
    setNewSuite((prevState: any) => ({
      ...prevState,
      columns: {
        ...prevState.columns,
        dashboards: suite.columns.dashboards.concat(dashboard),
      },
    }));
  };

  return (
    <>
      <Button
        variant="outline"
        type="secondary"
        icon="Plus"
        iconPlacement="left"
        onClick={handleOpenModal}
      >
        {buttonText}
      </Button>
      <Modal
        visible={isOpen}
        onCancel={handleCLoseModal}
        headerText={modalHeader}
        width={536}
        hasFooter={false}
      >
        <ModalContainer>
          <>
            {(() => {
              switch (step) {
                case 0:
                  return (
                    <CreateSuite
                      handleOnChange={handleSuiteChange}
                      handleCloseModal={handleCLoseModal}
                      handleSubmit={handleSubmit}
                      handleStepNext={nextStep}
                    />
                  );
                case 1:
                  return (
                    <AddBoard
                      handleOnChange={handleDashboardChange}
                      handleSubmit={handleSubmit}
                      handleStepNext={nextStep}
                      handleStepBack={prevStep}
                    />
                  );
                case 2:
                  return (
                    <ManageAccess
                      handleSubmit={handleSubmit}
                      handleStepBack={prevStep}
                    />
                  );
                default:
                  return console.log('Multistep modal');
              }
            })()}
          </>
        </ModalContainer>
      </Modal>
    </>
  );
};
