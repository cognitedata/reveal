import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Body, Colors, Icon } from '@cognite/cogs.js';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { startPnidParsingWorkflow } from 'modules/contextualization/pnidWorkflow';
import {
  useParsingJob,
  useJobStatus,
} from 'modules/contextualization/pnidParsing';
import { useActiveWorkflow } from 'hooks';
import MissingPermissionFeedback from 'components/MissingPermissionFeedback';
import { Flex } from 'components/Common';
import { useLabels } from './useLabels';

type Props = {
  jobStarted: boolean;
  setJobStarted: (jobStarted: boolean) => void;
};

export default function RunModelButton(props: Props): JSX.Element {
  const dispatch = useDispatch();
  const { jobStarted, setJobStarted } = props;
  const { workflowId } = useActiveWorkflow();

  const [renderFeedback, setRenderFeedback] = useState(false);

  const canEditFiles = usePermissions('filesAcl', 'WRITE');
  const canReadFiles = usePermissions('filesAcl', 'READ');
  const { statusCount } = useParsingJob(workflowId);
  const jobStatus = useJobStatus(workflowId, jobStarted);

  const { buttonLabel } = useLabels(jobStarted);

  const onRunModelClick = () => {
    if (jobStarted) return;
    if (canEditFiles && canReadFiles) {
      dispatch(startPnidParsingWorkflow.action(workflowId));
      setJobStarted(true);
    } else setRenderFeedback(true);
  };

  useEffect(() => {
    if (jobStatus === 'done' || jobStatus === 'error' || jobStatus === 'ready')
      setJobStarted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobStatus]);

  if (renderFeedback) {
    return (
      <>
        <MissingPermissionFeedback
          key="eventsAcl"
          acl="eventsAcl"
          type="WRITE"
        />
        <MissingPermissionFeedback key="filesAcl" acl="filesAcl" type="WRITE" />
      </>
    );
  }

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
          } diagrams are now interactive!`}
        </Body>
      </Flex>
    );

  return (
    <Flex>
      <Button
        type={jobStatus === 'error' ? 'secondary' : 'primary'}
        onClick={onRunModelClick}
        disabled={jobStarted}
        icon={
          (jobStarted && 'LoadingSpinner') ||
          (jobStatus === 'error' && 'Refresh') ||
          undefined
        }
        iconPlacement="right"
      >
        {buttonLabel}
      </Button>
    </Flex>
  );
}
