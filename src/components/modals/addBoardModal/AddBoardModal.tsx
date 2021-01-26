import React, { useContext, useEffect, useState } from 'react';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { ApiClientContext } from 'providers/ApiClientProvider';
import { useDispatch, useSelector } from 'react-redux';
import { formState, isErrorListEmpty, suiteState } from 'store/forms/selectors';
import { RootDispatcher } from 'store/types';
import { Suite } from 'store/suites/types';
import { modalClose } from 'store/modals/actions';
import { Button, Icon } from '@cognite/cogs.js';
import Modal from 'components/modals/simpleModal/Modal';
import { BoardForm } from 'components/modals/multiStepModal/steps';
import { modalSettings } from 'components/modals/config';
import { ModalFooter, ModalContainer } from 'components/modals/elements';
import { useFormState } from 'hooks';
import { saveForm } from 'store/forms/thunks';

interface Props {
  dataItem: Suite;
}

const AddBoardModal: React.FC<Props> = ({ dataItem }: Props) => {
  const { initForm, clearForm } = useFormState();
  const client = useContext(CdfClientContext);
  const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();
  const suite = useSelector(suiteState);
  const hasErrors = !useSelector(isErrorListEmpty);
  const { saving: formSaving } = useSelector(formState);
  const [filesUploadQueue] = useState(new Map());

  useEffect(() => {
    initForm(dataItem);
  }, [initForm, dataItem]);

  const handleCloseModal = () => {
    clearForm();
    filesUploadQueue.clear();
    dispatch(modalClose());
  };

  const handleSubmit = async () => {
    if (hasErrors) return;
    await dispatch(saveForm(client, apiClient, filesUploadQueue, suite));
    handleCloseModal();
  };

  const footer = (
    <ModalFooter>
      <Button variant="ghost" onClick={handleCloseModal} disabled={formSaving}>
        Cancel
      </Button>
      {formSaving ? (
        <Icon type="Loading" />
      ) : (
        <Button type="primary" onClick={handleSubmit}>
          {modalSettings.edit.buttons.save}
        </Button>
      )}
    </ModalFooter>
  );

  return (
    <>
      <Modal
        visible
        onCancel={handleCloseModal}
        headerText="Add board to suite"
        footer={footer}
        width={modalSettings.create.width.boards}
      >
        <ModalContainer>
          <BoardForm filesUploadQueue={filesUploadQueue} />
        </ModalContainer>
      </Modal>
    </>
  );
};

export default AddBoardModal;
