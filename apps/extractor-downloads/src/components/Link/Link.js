import React from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';

const propTypes = {
  to: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      pathname: PropTypes.string,
      search: PropTypes.string,
    }),
  ]).isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

const defaultProps = {
  children: null,
};

// Link replaces the default Link component from react-router-dom
//   by prefixing all links with /tenant/ and suffixing them with
//   ?env=environment when necessary, so subapps don't have to add that
//   to all links
// Everything else behaves like the react-router-dom Link component
const Link = ({ to, ...props }) => {
  let dest = to;
  const link = createLink(dest);
  if (typeof dest === 'string') {
    dest = link;
  } else if (typeof dest === 'object') {
    const [pathname, search] = link.split('?');
    dest.pathname = pathname;
    if (search) {
      dest.search = `?${search}`;
    }
  }
  return (
    <RouterLink to={dest} {...props}>
      {props.children}
    </RouterLink>
  );
};

Link.propTypes = propTypes;
Link.defaultProps = defaultProps;

export default Link;
