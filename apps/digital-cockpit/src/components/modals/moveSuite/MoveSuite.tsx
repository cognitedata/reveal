import React, { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootDispatcher } from 'store/types';
import { modalClose } from 'store/modals/actions';
import { Button, Icon, Title } from '@cognite/cogs.js';
import { ApiClientContext } from 'providers/ApiClientProvider';
import Modal from 'components/modals/simpleModal/Modal';
import { ModalFooter } from 'components/modals/elements';
import { useMetrics } from 'utils/metrics';
import { Suite } from 'store/suites/types';
import { suitesByKey } from 'store/suites/selectors';
import { moveSuite as moveSuiteDispatcher } from 'store/suites/thunks';
import SuitesTree from 'components/modals/SuitesTree';
import { useHistory } from 'react-router-dom';
import * as Sentry from '@sentry/browser';

interface Props {
  suiteItem: Suite;
}

const MoveSuite: React.FC<Props> = ({ suiteItem: currentSuite }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();
  const metrics = useMetrics('EditSuite');
  const [targetSuiteKey, setTargetSuiteKey] = useState<
    string | undefined | null
  >(currentSuite.parent);
  const byKey = useSelector(suitesByKey);
  const [isProcessing, setIsProcessing] = useState(false);
  const history = useHistory();
  if (!currentSuite) {
    Sentry.captureMessage(
      'MoveSuite: No source suite provided',
      Sentry.Severity.Error
    );
    return null;
  }

  const childSuitesKeys =
    Object.values(byKey).reduce(
      (acc, suite) => {
        if (suite.parent && acc.includes(suite.parent as string)) {
          acc.push(suite.key);
        }
        return acc;
      },
      [currentSuite.key] as string[]
    ) || [];

  const handleClose = () => {
    dispatch(modalClose());
  };

  const save = async () => {
    if (targetSuiteKey === undefined) {
      return;
    }

    setIsProcessing(true);
    metrics.track('MoveSuite');

    const targetSuite = byKey[targetSuiteKey || ''];
    const parentSuite = byKey[currentSuite.parent || ''];
    // move a board from one source to target suites
    await dispatch(
      moveSuiteDispatcher(apiClient, {
        currentSuite,
        targetSuite,
        parentSuite,
      })
    );
    handleClose();
    history.push(`/suites/${currentSuite.key}`);
  };

  const handleOnChange = (key: string | null) => {
    setTargetSuiteKey(key);
  };

  const footer = (
    <ModalFooter>
      <Button onClick={handleClose} disabled={isProcessing}>
        Cancel
      </Button>
      {isProcessing ? (
        <Icon type="Loader" />
      ) : (
        <Button type="primary" iconPlacement="left" onClick={save}>
          Save
        </Button>
      )}
    </ModalFooter>
  );

  return (
    <Modal
      visible
      onCancel={handleClose}
      headerText="Move suite"
      footer={footer}
      width={400}
      underlineColor="#db0657"
    >
      <Title level={4} style={{ marginBottom: '10px' }}>
        Select the target suite for <i>{currentSuite.title}</i>
      </Title>
      <div style={{ maxHeight: '60vh', minHeight: '30vh' }}>
        <SuitesTree
          suitesByKey={byKey}
          selectedSuiteKey={targetSuiteKey}
          onSelect={handleOnChange}
          showRoot
          disabledKeys={[currentSuite.key, ...childSuitesKeys]}
        />
      </div>
    </Modal>
  );
};

export default MoveSuite;
