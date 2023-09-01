import { CSSProperties, ReactNode } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { createLink } from '@cognite/cdf-utilities';

interface LinkProps {
  to: string;
  onClick?: () => void;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

const Link = ({ className, to, onClick, children, style }: LinkProps) => {
  const navigate = useNavigate();
  const url = createLink(to);

  return (
    <RouterLink
      className={className}
      to={url}
      onClick={onClick ?? (() => navigate(url))}
      style={style}
    >
      {children}
    </RouterLink>
  );
};

export default Link;
