import { Body } from '@cognite/cogs.js';
import Link from 'components/Link';
import { ReactNode } from 'react';

type ResourcePropertyProps = {
  value: ReactNode;
  isLink?: boolean | undefined;
  redirectURL?: string;
};

const ResourceProperty = ({
  value,
  isLink,
  redirectURL,
}: ResourcePropertyProps): JSX.Element => {
  return (
    <Body level={2}>
      {isLink && redirectURL ? (
        <Link to={redirectURL} target="_blank">
          {value}
        </Link>
      ) : (
        value
      )}
    </Body>
  );
};

export default ResourceProperty;
