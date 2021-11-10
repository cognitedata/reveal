import React, { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootDispatcher } from 'store/types';
import { modalClose } from 'store/modals/actions';
import { Button, Icon, Radio, Title } from '@cognite/cogs.js';
import { ApiClientContext } from 'providers/ApiClientProvider';
import Modal from 'components/modals/simpleModal/Modal';
import { ModalFooter, RadioItemsContainer } from 'components/modals/elements';
import { useMetrics } from 'utils/metrics';
import { Board, Suite } from 'store/suites/types';
import { getSuites } from 'store/suites/selectors';
import { moveBoard as moveBoardDispatcher } from 'store/suites/thunks';
import { useHistory } from 'react-router-dom';
import { deleteLayoutItems } from 'store/layout/thunks';
import * as Sentry from '@sentry/browser';

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
  const [targetSuiteKey, setTargetSuiteKey] = useState<string>('');
  const suites = useSelector(getSuites);
  const [isProcessing, setIsProcessing] = useState(false);
  const history = useHistory();
  if (!sourceSuite) {
    Sentry.captureMessage(
      'MoveBoard: No source suite provided',
      Sentry.Severity.Error
    );
    return null;
  }
  const otherSuites = suites?.filter(
    (suite) =>
      suite.key !== sourceSuite.key &&
      suite.key !== sourceSuite.parent &&
      !sourceSuite.suites?.includes(suite.key)
  );
  const parentSuite = sourceSuite.parent
    ? suites?.find((suite) => suite.key === sourceSuite.parent)
    : null;
  const childSuites = sourceSuite.suites?.length
    ? suites?.filter((suite) => sourceSuite.suites?.includes(suite.key))
    : null;

  const handleClose = () => {
    dispatch(modalClose());
  };

  const save = async () => {
    metrics.track('MoveBoard');
    const targetSuite = suites?.find((suite) => suite.key === targetSuiteKey);
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

  const handleOnChange = (key: string) => {
    setTargetSuiteKey(key);
  };

  const footer = (
    <ModalFooter>
      <Button onClick={handleClose} disabled={isProcessing}>
        Cancel
      </Button>
      {isProcessing ? (
        <Icon type="Loading" />
      ) : (
        <Button type="primary" iconPlacement="left" onClick={save}>
          Save
        </Button>
      )}
    </ModalFooter>
  );

  return (
    <>
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
        {!!parentSuite && (
          <RadioItemsContainer>
            <Title level={6}>Parent suite</Title>
            <Radio
              name="suiteKey"
              key={parentSuite.key}
              value={parentSuite.key}
              checked={targetSuiteKey === parentSuite.key}
              onChange={() => handleOnChange(parentSuite.key)}
            >
              {parentSuite.title}
            </Radio>
          </RadioItemsContainer>
        )}
        {!!childSuites && childSuites?.length > 0 && (
          <RadioItemsContainer>
            <Title level={6}>Child suites</Title>
            {childSuites?.map((suite: Suite) => (
              <Radio
                name="suiteKey"
                key={suite.key}
                value={suite.key}
                checked={targetSuiteKey === suite.key}
                onChange={() => handleOnChange(suite.key)}
              >
                {suite.title}
              </Radio>
            ))}
          </RadioItemsContainer>
        )}
        {!!otherSuites && otherSuites?.length > 0 && (
          <RadioItemsContainer>
            <Title level={6}>Other suites</Title>

            {otherSuites?.map((suite: Suite) => (
              <Radio
                name="suiteKey"
                key={suite.key}
                value={suite.key}
                checked={targetSuiteKey === suite.key}
                onChange={() => handleOnChange(suite.key)}
              >
                {suite.title}
              </Radio>
            ))}
          </RadioItemsContainer>
        )}
      </Modal>
    </>
  );
};

export default MoveBoard;
