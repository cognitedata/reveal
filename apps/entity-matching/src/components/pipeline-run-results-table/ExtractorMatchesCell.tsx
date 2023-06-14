import { Flex } from '@cognite/cogs.js';
import {
  EMPipelineRegexExtractor,
  EMPipelineResource,
} from 'hooks/entity-matching-pipelines';
import { MatchColorsByExtractorIndex } from './ExpandedRule';
import ResourceCell from './ResourceCell';

type ExtractorMatchesCellProps = {
  extractors: EMPipelineRegexExtractor[];
  entitySetToRender: EMPipelineRegexExtractor['entitySet'];
  matchColorsByExtractorIndex: MatchColorsByExtractorIndex;
  resource: EMPipelineResource;
};

const ExtractorMatchesCell = ({
  extractors,
  entitySetToRender,
  matchColorsByExtractorIndex,
  resource,
}: ExtractorMatchesCellProps): JSX.Element => {
  return (
    <Flex direction="column" gap={8}>
      {extractors.map((extractor, extractorIndex) => {
        if (extractor.entitySet === entitySetToRender) {
          return (
            <ResourceCell
              key={extractor.field}
              matchColorsByGroupIndex={
                matchColorsByExtractorIndex[extractorIndex]
              }
              pattern={extractor.pattern}
              preferredProperties={[extractor.field]}
              resource={resource}
            />
          );
        }
      })}
    </Flex>
  );
};

export default ExtractorMatchesCell;
