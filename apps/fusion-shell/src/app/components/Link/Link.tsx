import { CSSProperties, ReactNode } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { createLink } from '@cognite/cdf-utilities';

interface LinkProps {
  to: string;
  onClick?: () => void;
  children: ReactNode;
  style?: CSSProperties;
}

const Link = ({ to, onClick, children, style }: LinkProps) => {
  const navigate = useNavigate();
  const url = createLink(to);

  return (
    <RouterLink
      to={url}
      onClick={onClick ?? (() => navigate(url))}
      style={style}
    >
      {children}
    </RouterLink>
  );
};

export default Link;
