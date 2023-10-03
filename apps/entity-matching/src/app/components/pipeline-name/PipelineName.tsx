import { Link } from 'react-router-dom';

import { Body } from '@cognite/cogs.js';

import { createInternalLink } from '../../utils';

type PipelineNameProps = {
  id: number;
  name: string;
};

const PipelineName = ({ id, name }: PipelineNameProps): JSX.Element => {
  return (
    <Body level={2} strong>
      <Link to={createInternalLink(`pipeline/${id}/details/sources`)}>
        {name || id}
      </Link>
    </Body>
  );
};

export default PipelineName;
