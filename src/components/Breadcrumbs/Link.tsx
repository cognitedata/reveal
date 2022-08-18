import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getUrlWithQueryParams } from 'utils/config';

type Props = {
  to: string;
  children?: React.ReactNode;
};

// Link replaces the default Link component from react-router-dom
//   by prefixing all links with /tenant/ and suffixing them with
//   ?env=environment when necessary, so subapps don't have to add that
//   to all links
// Everything else behaves like the react-router-dom Link component
const Link = ({ to, ...props }: Props) => {
  const link = getUrlWithQueryParams(to);
  return (
    <RouterLink to={link} {...props}>
      {props.children}
    </RouterLink>
  );
};

export default Link;
