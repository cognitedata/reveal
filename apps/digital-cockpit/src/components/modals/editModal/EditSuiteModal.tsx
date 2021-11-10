import React, { useContext, useEffect, useState } from 'react';
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
import { ModalContainer } from '../elements';
import Modal from '../simpleModal/Modal';

interface Props {
  suiteItem?: Suite;
  parentSuiteItem?: Suite;
}

const EditSuiteModal: React.FC<Props> = ({
  suiteItem,
  parentSuiteItem,
}: Props) => {
  const dispatch = useDispatch<RootDispatcher>();
  const apiClient = useContext(ApiClientContext);
  const history = useHistory();
  const metrics = useMetrics('EditSuite');
  const [isNew, setIsNew] = useState(false);
  const [suite, setSuite] = useState(suiteItem);
  const nextSuiteOrder = useSelector(getNextSuiteOrder);

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

  const handleSave = async (values: Partial<Suite>) => {
    const updatedSuite = {
      ...suite,
      ...values,
      ...(parentSuiteItem ? { parent: parentSuiteItem.key } : []),
    } as Suite;
    // save updated suite
    await dispatch(
      saveForm({
        apiClient,
        suite: updatedSuite,
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
          modalProps: { suiteItem: updatedSuite, parentSuiteItem },
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
      footer={<></>}
    >
      <ModalContainer>
        <SuiteForm
          suite={suite as Suite}
          isNew={isNew}
          handleSave={handleSave}
          handleEditBoards={handleEditBoards}
          handleCancel={cancel}
        />
      </ModalContainer>
    </Modal>
  );
};

export default EditSuiteModal;
