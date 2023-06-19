import React from 'react';

import styled from 'styled-components';

import { Badge } from 'antd';
import PropTypes from 'prop-types';

const mapStatusToBadge = {
  Done: 'success',
  Queued: 'warning',
  Processing: 'processing',
  Failed: 'error',
};

export const mapStatusToColor = {
  Done: 'green',
  Success: 'green',
  Queued: 'gray',
  Processing: 'blue',
  Failed: 'red',
  Failure: 'red',
};

const Status = ({ status }) => (
  <span>
    <Badge status={mapStatusToBadge[status] || 'error'} />
    <StatusText>{status}</StatusText>
  </span>
);

const StatusText = styled.span`
  margin-left: 8px;
`;

Status.propTypes = {
  status: PropTypes.string.isRequired,
};

export default Status;
