import { createLink } from '@cognite/cdf-utilities';
import { Body, Flex } from '@cognite/cogs.js';
import Link from 'components/Link';
import { getExtractionPipelineUIUrl } from 'utils/extpipeUtils';
import { Extpipe } from 'utils/types';

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
