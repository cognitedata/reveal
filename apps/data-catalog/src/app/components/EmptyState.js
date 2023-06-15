import PropTypes from 'prop-types';
import { Illustrations } from '@cognite/cogs.js';

const propTypes = {
  type: PropTypes.string,
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
        <Illustrations.Solo type={type} {...rest} />
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
