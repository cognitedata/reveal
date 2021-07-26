import React, { useContext, useEffect, useState } from 'react';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { ApiClientContext } from 'providers/ApiClientProvider';
import { useDispatch, useSelector } from 'react-redux';
import { filesUploadState, formState, suiteState } from 'store/forms/selectors';
import { RootDispatcher } from 'store/types';
import { Suite, Board } from 'store/suites/types';
import { modalClose } from 'store/modals/actions';
import { Button, Icon } from '@cognite/cogs.js';
import Modal from 'components/modals/simpleModal/Modal';
import { BoardForm } from 'components/modals/multiStepModal/steps';
import { modalSettings } from 'components/modals/config';
import { ModalContainer, ModalFooter } from 'components/modals/elements';
import { useFormState } from 'hooks';
import { saveForm } from 'store/forms/thunks';
import { useMetrics } from 'utils/metrics';
import { getConfigState } from 'store/config/selectors';
import { getLayoutDeleteQueue } from 'store/layout/selectors';
import { resetLayoutDeleteQueue } from 'store/layout/actions';

interface Props {
  suite: Suite;
  board: Board;
}

const EditBoardModal: React.FC<Props> = ({
  suite: suiteItem,
  board: boardItem,
}: Props) => {
  const { initForm, clearForm } = useFormState();
  const client = useContext(CdfClientContext);
  const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();
  const suite = useSelector(suiteState);
  const { saving: formSaving } = useSelector(formState);
  const { deleteQueue: filesDeleteQueue } = useSelector(filesUploadState);
  const layoutDeleteQueue = useSelector(getLayoutDeleteQueue);
  const [filesUploadQueue] = useState(new Map());
  const { dataSetId } = useSelector(getConfigState);
  const metrics = useMetrics('EditSuite');

  useEffect(() => {
    initForm(suiteItem, boardItem);
  }, [initForm, boardItem, suiteItem]);

  const handleCloseModal = () => {
    clearForm();
    filesUploadQueue.clear();
    dispatch(resetLayoutDeleteQueue());
    dispatch(modalClose());
  };

  const handleSubmit = async () => {
    await dispatch(
      saveForm({
        client,
        apiClient,
        suite,
        filesUploadQueue,
        filesDeleteQueue,
        layoutDeleteQueue,
        dataSetId,
      })
    );
    metrics.track('Saved', {
      suiteKey: suite.key,
      suite: suite.title,
      component: 'EditBoardModal',
    });
    handleCloseModal();
  };

  const cancel = () => {
    metrics.track('Cancel', { component: 'EditBoardModal' });
    handleCloseModal();
  };

  const footer = (
    <ModalFooter>
      <Button type="ghost" onClick={cancel} disabled={formSaving}>
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
        onCancel={cancel}
        headerText="Edit board"
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

export default EditBoardModal;
