import { Body } from '@cognite/cogs.js';
import { Link } from 'react-router-dom';

import { createInternalLink } from 'utils';

type PipelineNameProps = {
  id: number;
  name: string;
};

const TransformationName = ({ id, name }: PipelineNameProps): JSX.Element => {
  return (
    <Body level={2} strong>
      <Link to={createInternalLink(id)}>{name || id}</Link>
    </Body>
  );
};

export default TransformationName;
