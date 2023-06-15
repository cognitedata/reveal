import Link from '@transformations/components/link/Link';
import { TransformationRead } from '@transformations/types';
import { createInternalLink } from '@transformations/utils';

import { Body } from '@cognite/cogs.js';

type TransformationNameProps = {
  id: TransformationRead['id'];
  name: TransformationRead['name'];
};

const TransformationName = ({
  id,
  name,
}: TransformationNameProps): JSX.Element => {
  return (
    <Body level={2} strong>
      <Link to={createInternalLink(id)}>{name}</Link>
    </Body>
  );
};

export default TransformationName;
