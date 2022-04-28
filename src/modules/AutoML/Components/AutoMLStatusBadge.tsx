/* eslint-disable no-nested-ternary */
import React from 'react';
import { Body } from '@cognite/cogs.js';
import { JobStatus } from 'src/api/vision/detectionModels/types';
import styled from 'styled-components';
import { StatusColors } from 'src/constants/Colors';

export const AutoMLStatusBadge = (props: {
  status: JobStatus;
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

  return (
    <Container>
      <StatusDot data-testid="status-dot" style={{ background }} />
      {props.large ? (
        <Body strong level={2}>
          {props.status || 'Queued'}
        </Body>
      ) : (
        <div>{props.status || 'Queued'}</div>
      )}
    </Container>
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
