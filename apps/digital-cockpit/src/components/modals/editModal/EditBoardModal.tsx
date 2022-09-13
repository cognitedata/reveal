import React, { useContext } from 'react';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { ApiClientContext } from 'providers/ApiClientProvider';
import { useDispatch, useSelector } from 'react-redux';
import { filesUploadState } from 'store/forms/selectors';
import { RootDispatcher } from 'store/types';
import { Suite, Board } from 'store/suites/types';
import { modalClose } from 'store/modals/actions';
import Modal from 'components/modals/simpleModal/Modal';
import { BoardForm } from 'components/forms';
import { ModalContainer } from 'components/modals/elements';
import { saveForm, addChildSuite } from 'store/forms/thunks';
import { useMetrics } from 'utils/metrics';
import { getConfigState } from 'store/config/selectors';
import { getLayoutDeleteQueue } from 'store/layout/selectors';
import { resetLayoutDeleteQueue } from 'store/layout/actions';
import { useHistory } from 'react-router-dom';

interface Props {
  suiteItem: Suite;
  parentSuiteItem?: Suite;
  boardItem?: Board;
  filesUploadQueue?: Map<string, File>;
}

const EditBoardModal: React.FC<Props> = ({
  suiteItem,
  parentSuiteItem,
  boardItem,
  filesUploadQueue = new Map(),
}: Props) => {
  const client = useContext(CdfClientContext);
  const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();
  const { deleteQueue: filesDeleteQueue } = useSelector(filesUploadState);
  const layoutDeleteQueue = useSelector(getLayoutDeleteQueue);
  const { dataSetId } = useSelector(getConfigState);
  const metrics = useMetrics('EditSuite');
  const history = useHistory();

  const handleCloseModal = () => {
    filesUploadQueue.clear();
    dispatch(resetLayoutDeleteQueue());
    history.push(`/suites/${suiteItem.key}`);
    dispatch(modalClose());
  };

  const handleSave = async (updatedSuite: Suite) => {
    await dispatch(
      saveForm({
        client,
        apiClient,
        suite: updatedSuite,
        filesUploadQueue,
        filesDeleteQueue,
        layoutDeleteQueue,
        dataSetId,
      })
    );
    if (parentSuiteItem) {
      // add a child suite key to the parent suite and save
      await dispatch(
        addChildSuite(apiClient, parentSuiteItem, updatedSuite.key)
      );
    }
    metrics.track('Saved', {
      suiteKey: updatedSuite.key,
      suite: updatedSuite.title,
      component: 'EditBoardModal',
    });
    handleCloseModal();
  };

  const cancel = () => {
    metrics.track('Cancel', { component: 'EditBoardModal' });
    handleCloseModal();
  };

  return (
    <Modal
      visible
      onCancel={cancel}
      headerText="Board form"
      // eslint-disable-next-line react/jsx-no-useless-fragment
      footer={<></>}
      width={904}
    >
      <ModalContainer>
        <BoardForm
          filesUploadQueue={filesUploadQueue}
          initialBoardItem={boardItem}
          suite={suiteItem}
          handleSave={handleSave}
          handleCancel={cancel}
        />
      </ModalContainer>
    </Modal>
  );
};

export default EditBoardModal;
