import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { ThunkDispatch } from '@reduxjs/toolkit';
import { AnyAction } from 'redux';

import { Button, Body, Colors, Icon } from '@cognite/cogs.js';

import { Flex } from '../../../components/Common';
import {
  useJobStatusLabels,
  useJobStarted,
  useParsingJob,
  useJobStatus,
} from '../../../hooks';
import { startPnidParsingWorkflow } from '../../../modules/workflows';

export default function RunModelButton(): JSX.Element {
  const dispatch = useDispatch<ThunkDispatch<any, void, AnyAction>>();
  const { jobStarted, setJobStarted, assetsLoaded } = useJobStarted();

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
            color: Colors['decorative--grayscale--600'],
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
        disabled={jobStarted || !assetsLoaded}
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
