import Link from '@data-catalog-app/components/Link';
import { getExtractionPipelineUIUrl } from '@data-catalog-app/utils/extpipeUtils';
import { Extpipe } from '@data-catalog-app/utils/types';

import { createLink } from '@cognite/cdf-utilities';
import { Body, Flex } from '@cognite/cogs.js';

type ExtractionPipelineNameProps = Pick<Extpipe, 'id' | 'name'>;

const ExtractionPipelineName = ({
  name,
  id,
}: ExtractionPipelineNameProps): JSX.Element => {
  return (
    <Body level={2} strong>
      <Flex alignItems="center" gap={4}>
        <Link to={createLink(getExtractionPipelineUIUrl(`/extpipe/${id}`))}>
          {name ?? id}
        </Link>
      </Flex>
    </Body>
  );
};

export default ExtractionPipelineName;
