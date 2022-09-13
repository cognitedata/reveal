import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Suite } from 'store/suites/types';
import { SuiteForm } from 'components/forms';
import { useDispatch, useSelector } from 'react-redux';
import { modalClose, modalOpen } from 'store/modals/actions';
import { useHistory } from 'react-router-dom';
import { RootDispatcher } from 'store/types';
import { useMetrics } from 'utils/metrics';
import { ApiClientContext } from 'providers/ApiClientProvider';
import { saveForm, addChildSuite } from 'store/forms/thunks';
import { getNextSuiteOrder } from 'store/suites/selectors';
import { getEmptySuite } from 'utils/forms';
import { filesUploadState } from 'store/forms/selectors';
import { getConfigState } from 'store/config/selectors';
import { CdfClientContext } from 'providers/CdfClientProvider';

import Modal from '../simpleModal/Modal';
import { ModalContainer } from '../elements';

interface Props {
  suiteItem?: Suite;
  parentSuiteItem?: Suite;
}

const EditSuiteModal: React.FC<Props> = ({
  suiteItem,
  parentSuiteItem,
}: Props) => {
  const dispatch = useDispatch<RootDispatcher>();
  const client = useContext(CdfClientContext);
  const apiClient = useContext(ApiClientContext);
  const history = useHistory();
  const metrics = useMetrics('EditSuite');
  const [isNew, setIsNew] = useState(false);
  const [suite, setSuite] = useState(suiteItem);
  const nextSuiteOrder = useSelector(getNextSuiteOrder);
  const [filesUploadQueue] = useState<Map<string, File>>(new Map());
  const { deleteQueue: filesDeleteQueue } = useSelector(filesUploadState);
  const { dataSetId } = useSelector(getConfigState);

  const trackMetrics = (name: string, props?: any) => {
    metrics.track(name, { ...props, component: 'EditSuiteModal' });
  };
  const cancel = () => {
    trackMetrics('Cancel');
    dispatch(modalClose());
  };
  useEffect(() => {
    if (!suiteItem) {
      setIsNew(true);
      setSuite(getEmptySuite(nextSuiteOrder));
    }
  }, []);

  if (!suite) {
    // wait for empty suite initialization
    return null;
  }

  const handleSave = async (values: Partial<Suite>) => {
    const updatedSuite = {
      ...suite,
      ...values,
      ...(parentSuiteItem ? { parent: parentSuiteItem.key } : []),
    } as Suite;
    // save updated suite
    await dispatch(
      saveForm({
        client,
        apiClient,
        suite: updatedSuite,
        filesUploadQueue,
        filesDeleteQueue,
        dataSetId,
      })
    );

    if (parentSuiteItem) {
      // add a child suite key to the parent suite and save
      await dispatch(
        addChildSuite(apiClient, parentSuiteItem, updatedSuite.key)
      );
    }
    trackMetrics('Saved', {
      suiteKey: updatedSuite.key,
      suite: updatedSuite.title,
    });
    history.push(`/suites/${updatedSuite.key}`);
  };

  const handleEditBoards = (values: Partial<Suite>) => {
    const updatedSuite = {
      ...suite,
      ...values,
      ...(parentSuiteItem ? { parent: parentSuiteItem.key } : []),
    } as Suite;
    dispatch(modalClose());
    setTimeout(() =>
      dispatch(
        modalOpen({
          modalType: 'EditBoard',
          modalProps: {
            suiteItem: updatedSuite,
            parentSuiteItem,
            filesUploadQueue,
          },
        })
      )
    );
  };

  return (
    <Modal
      visible
      onCancel={cancel}
      headerText={
        !isNew
          ? 'Edit suite'
          : `Create a new ${parentSuiteItem ? 'subsuite' : 'suite'}`
      }
      width={536}
      // eslint-disable-next-line react/jsx-no-useless-fragment
      footer={<></>}
    >
      <ModalContainer>
        <SuiteForm
          suite={suite}
          isNew={isNew}
          withThumbnail={Boolean(parentSuiteItem || suite.parent)}
          handleSave={handleSave}
          handleEditBoards={handleEditBoards}
          handleCancel={cancel}
          filesUploadQueue={filesUploadQueue}
        />
      </ModalContainer>
    </Modal>
  );
};

export default EditSuiteModal;
