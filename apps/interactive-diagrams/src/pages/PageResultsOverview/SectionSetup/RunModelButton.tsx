import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Body, Colors, Icon } from '@cognite/cogs.js';
import { startPnidParsingWorkflow } from 'modules/workflows';
import {
  useJobStatusLabels,
  useJobStarted,
  useParsingJob,
  useJobStatus,
} from 'hooks';
import { Flex } from 'components/Common';

export default function RunModelButton(): JSX.Element {
  const dispatch = useDispatch();
  const { jobStarted, setJobStarted } = useJobStarted();

  const { statusCount } = useParsingJob();
  const jobStatus = useJobStatus();

  const { buttonLabel } = useJobStatusLabels();

  const isJobRejected = jobStatus === 'error' || jobStatus === 'rejected';
  const isJobDone = jobStatus === 'done' || jobStatus === 'error';

  const onRunModelClick = () => {
    if (jobStarted) return;
    setJobStarted(true);
    dispatch(startPnidParsingWorkflow.action());
  };

  useEffect(() => {
    if (isJobRejected || isJobDone) setJobStarted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobStatus]);

  if (jobStatus === 'incomplete') return <span />;
  if (jobStatus === 'done')
    return (
      <Flex row align>
        <Icon type="Checkmark" />
        <Body
          level={2}
          style={{
            color: Colors['greyscale-grey6'].hex(),
            marginLeft: '12px',
          }}
        >
          {`${statusCount?.completed ?? 0}/${
            (statusCount?.completed ?? 0) + (statusCount?.failed ?? 0)
          } diagrams are now interactive`}
        </Body>
      </Flex>
    );

  return (
    <Flex>
      <Button
        type={isJobRejected ? 'secondary' : 'primary'}
        onClick={onRunModelClick}
        disabled={jobStarted}
        icon={
          (jobStarted && 'Loader') || (isJobRejected && 'Refresh') || undefined
        }
        iconPlacement="right"
      >
        {buttonLabel}
      </Button>
    </Flex>
  );
}
