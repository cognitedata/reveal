import { Body } from '@cognite/cogs.js';
import Link from 'components/Link';
import { ReactNode } from 'react';

type ResourcePropertyProps = {
  value: ReactNode;
  isLink?: boolean | undefined;
  redirectURL?: string;
  onClick?: () => void;
};

const ResourceProperty = ({
  value,
  isLink,
  redirectURL,
  onClick,
}: ResourcePropertyProps): JSX.Element => {
  return (
    <Body level={2}>
      {isLink && redirectURL ? (
        <Link to={redirectURL} target="_blank" onClick={onClick}>
          {value}
        </Link>
      ) : (
        value
      )}
    </Body>
  );
};

export default ResourceProperty;
