import React from 'react';
import PropTypes from 'prop-types';
import { Graphic } from '@cognite/cogs.js';

const propTypes = {
  type: PropTypes.oneOf([
    'DataKits',
    'DataSets',
    'Favorites',
    'Recents',
    'RuleCreating',
    'RuleMonitoring',
    'Search',
    'ThreeDModel',
  ]),
  text: PropTypes.string,
  extra: PropTypes.node,
};

const defaultProps = {
  type: 'Search',
  text: 'No data',
  extra: null,
};

const EmptyState = (props) => {
  const { type, text, extra, ...rest } = props;
  return (
    <div
      style={{
        textAlign: 'center',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Graphic type={type} {...rest} />
      </div>
      <div>
        <p>{text}</p>
      </div>
      {extra}
    </div>
  );
};

EmptyState.propTypes = propTypes;
EmptyState.defaultProps = defaultProps;

export default EmptyState;
