import React from 'react';
import { Body } from '@cognite/cogs.js';
import { EXT_PIPE_PATH } from '@extraction-pipelines/routing/RoutingConfig';
import { EXTRACTION_PIPELINES_PATH } from '@extraction-pipelines/utils/baseURL';
import { createLink } from '@cognite/cdf-utilities';
import Link from '@extraction-pipelines/components/links/Link';

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
