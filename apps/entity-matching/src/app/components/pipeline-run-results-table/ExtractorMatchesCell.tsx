import { Flex } from '@cognite/cogs.js';

import { EMPipelineResource } from '../../hooks/entity-matching-pipelines';
import { ColoredExtractor } from '../../utils/colored-rules';

import ResourceCell from './ResourceCell';

type ExtractorMatchesCellProps = {
  extractors: ColoredExtractor[];
  entitySetToRender: ColoredExtractor['entitySet'];
  resource: EMPipelineResource;
};

const ExtractorMatchesCell = ({
  extractors,
  entitySetToRender,
  resource,
}: ExtractorMatchesCellProps): JSX.Element => {
  return (
    <Flex direction="column" gap={8}>
      {extractors.map((extractor) => {
        if (extractor.entitySet === entitySetToRender) {
          return (
            <ResourceCell
              key={extractor.field}
              preferredProperties={[extractor.field]}
              resource={resource}
            />
          );
        } else {
          return undefined;
        }
      })}
    </Flex>
  );
};

export default ExtractorMatchesCell;
