import { Flex } from '@cognite/cogs.js';
import {
  EMPipelineRegexExtractor,
  EMPipelineResource,
} from 'hooks/entity-matching-pipelines';
import ResourceCell from './ResourceCell';

type ExtractorMatchesCellProps = {
  extractors: EMPipelineRegexExtractor[];
  entitySetToRender: EMPipelineRegexExtractor['entitySet'];
  resource: EMPipelineResource;
};

const ExtractorMatchesCell = ({
  extractors,
  entitySetToRender,
  resource,
}: ExtractorMatchesCellProps): JSX.Element => {
  const filteredExtractors = extractors.filter(
    ({ entitySet }) => entitySet === entitySetToRender
  );

  return (
    <Flex direction="column" gap={8}>
      {filteredExtractors.map((extractor) => (
        <ResourceCell
          key={extractor.field}
          preferredProperties={[extractor.field]}
          resource={resource}
        />
      ))}
    </Flex>
  );
};

export default ExtractorMatchesCell;
