import React from 'react';

import PropTypes from 'prop-types';

import { Graphic } from '../../../../assets/Graphics/Graphic';

export enum EmptyStateOptions {
  SearchEmpty = 'SearchEmpty',
  ThreeDModel = 'ThreeDModel',
  Favorites = 'Favorites',
}

const propTypes = {
  type: PropTypes.oneOf(Object.values(EmptyStateOptions)),
  text: PropTypes.string,
  extra: PropTypes.node,
};

const defaultProps = {
  type: EmptyStateOptions.SearchEmpty,
  text: 'No data',
  extra: null,
};

const EmptyState = (props) => {
  const { type, text, extra } = props;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        placeItems: 'center',
        gap: '5px',
      }}
    >
      <div>
        <div
          style={{
            width: '100px',
            height: '100px',
          }}
        >
          <Graphic type={type} />
        </div>
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
