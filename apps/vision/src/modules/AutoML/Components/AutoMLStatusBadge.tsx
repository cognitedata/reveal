/* eslint-disable no-nested-ternary */
import React from 'react';

import styled from 'styled-components';

import { Body, Icon, Tooltip } from '@cognite/cogs.js';

import { JobStatus } from '../../../api/vision/detectionModels/types';
import { StatusColors } from '../../../constants/Colors';

export const AutoMLStatusBadge = (props: {
  status: JobStatus;
  errorMessage?: string;
  large?: boolean;
}) => {
  const background =
    props.status === 'Completed'
      ? StatusColors.completed
      : props.status === 'Running' || props.status === 'Collecting'
      ? StatusColors.running
      : props.status === 'Failed'
      ? StatusColors.failed
      : StatusColors.queued;

  const showTooltip = !!(props.status === 'Failed' && props.errorMessage);
  return (
    <Tooltip
      content={<span>{props.errorMessage}</span>}
      disabled={!showTooltip}
    >
      <Container>
        <StatusDot data-testid="status-dot" style={{ background }} />
        {props.large ? (
          <Body strong level={2}>
            {props.status || 'Queued'}
          </Body>
        ) : (
          <div>{props.status || 'Queued'}</div>
        )}
        {showTooltip && (
          <div style={{ marginLeft: '6px' }}>
            {' '}
            <Icon type="Info" />
          </div>
        )}
      </Container>
    </Tooltip>
  );
};

const StatusDot = styled.div`
  height: 8px;
  width: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: center;
  align-items: center;
`;
