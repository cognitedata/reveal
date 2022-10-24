import { Body } from '@cognite/cogs.js';
import Link from 'components/Link';

type ResourcePropertyProps = {
  value: string | number | undefined;
  isLink?: boolean | undefined;
  redirectURL?: string;
};

const ResourceProperty = ({
  value,
  isLink,
  redirectURL,
}: ResourcePropertyProps): JSX.Element => {
  return (
    <Body level={2} strong>
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
