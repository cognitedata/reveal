import React, { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootDispatcher } from 'store/types';
import { modalClose } from 'store/modals/actions';
import { Button, Icon, Title } from '@cognite/cogs.js';
import { ApiClientContext } from 'providers/ApiClientProvider';
import Modal from 'components/modals/simpleModal/Modal';
import { ModalFooter } from 'components/modals/elements';
import { useMetrics } from 'utils/metrics';
import { Board, Suite } from 'store/suites/types';
import { suitesByKey } from 'store/suites/selectors';
import { moveBoard as moveBoardDispatcher } from 'store/suites/thunks';
import { useHistory } from 'react-router-dom-v5';
import { deleteLayoutItems } from 'store/layout/thunks';
import * as Sentry from '@sentry/browser';

import SuitesTree from '../SuitesTree';

interface Props {
  boardItem: Board;
  suiteItem: Suite;
}

const MoveBoard: React.FC<Props> = ({
  boardItem: board,
  suiteItem: sourceSuite,
}: Props) => {
  const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();
  const metrics = useMetrics('EditSuite');
  const [targetSuiteKey, setTargetSuiteKey] = useState<string | null>('');
  const byKey = useSelector(suitesByKey);
  const [isProcessing, setIsProcessing] = useState(false);
  const history = useHistory();
  if (!sourceSuite) {
    Sentry.captureMessage(
      'MoveBoard: No source suite provided',
      Sentry.Severity.Error
    );
    return null;
  }
  const handleClose = () => {
    dispatch(modalClose());
  };

  const save = async () => {
    if (!targetSuiteKey) {
      return;
    }
    metrics.track('MoveBoard');
    // const targetSuite = suites?.find((suite) => suite.key === targetSuiteKey);
    const targetSuite = byKey[targetSuiteKey];
    if (!targetSuite) {
      Sentry.captureMessage(
        'MoveBoard: No target suite found',
        Sentry.Severity.Error
      );
      return;
    }
    setIsProcessing(true);
    // move a board from one source to target suites
    await dispatch(
      moveBoardDispatcher(apiClient, board, sourceSuite, targetSuite)
    );
    // remove layout configuration for a board
    await dispatch(deleteLayoutItems(apiClient, [board.key]));
    handleClose();
    history.push(`/suites/${sourceSuite.key}`);
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
      headerText="Move board to a suite"
      footer={footer}
      width={400}
      underlineColor="#db0657"
    >
      <Title level={4} style={{ marginBottom: '10px' }}>
        Select a target suite
      </Title>

      <div style={{ maxHeight: '60vh', minHeight: '30vh' }}>
        <SuitesTree
          suitesByKey={byKey}
          selectedSuiteKey={targetSuiteKey}
          onSelect={handleOnChange}
          disabledKeys={[sourceSuite.key]}
        />
      </div>
    </Modal>
  );
};

export default MoveBoard;
