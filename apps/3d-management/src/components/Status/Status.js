import React from 'react';
import PropTypes from 'prop-types';
import Badge from 'antd/lib/badge';

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
    {status}
  </span>
);

Status.propTypes = {
  status: PropTypes.string.isRequired,
};

export default Status;
