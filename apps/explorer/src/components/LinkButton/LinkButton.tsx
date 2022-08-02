import { Button, ButtonProps } from '@cognite/cogs.js';
import { Link } from 'react-router-dom';

interface Props extends ButtonProps {
  to: string;
  replace?: boolean;
}

export const LinkButton: React.FC<React.PropsWithChildren<Props>> = ({
  to,
  replace = false,
  children,
  ...rest
}) => (
  <Link replace={replace} to={to}>
    <Button {...rest}>{children}</Button>
  </Link>
);
