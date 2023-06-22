import React from 'react';

import { createLink } from '@cognite/cdf-utilities';
import { Body } from '@cognite/cogs.js';

import { EXT_PIPE_PATH } from '../../../routing/RoutingConfig';
import { EXTRACTION_PIPELINES_PATH } from '../../../utils/baseURL';
import Link from '../../links/Link';

type ExtractionPipelineNameProps = {
  id: number;
  name: string;
};

const ExtractionPipelineName = ({
  id,
  name,
}: ExtractionPipelineNameProps): JSX.Element => {
  return (
    <Body level={2} strong>
      <Link
        to={createLink(`/${EXTRACTION_PIPELINES_PATH}/${EXT_PIPE_PATH}/${id}`)}
      >
        {name}
      </Link>
    </Body>
  );
};

export default ExtractionPipelineName;
