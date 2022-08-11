import { Button, ButtonProps } from '@cognite/cogs.js';
import { Link } from 'react-router-dom';

interface Props extends ButtonProps {
  to: string;
  replace?: boolean;
  fullWidth?: boolean;
}

const fullWidthStyle = {
  width: '100%',
};

export const LinkButton: React.FC<React.PropsWithChildren<Props>> = ({
  to,
  replace = false,
  children,
  fullWidth,
  ...rest
}) => (
  <Link replace={replace} to={to}>
    <Button style={fullWidth ? fullWidthStyle : undefined} {...rest}>
      {children}
    </Button>
  </Link>
);
