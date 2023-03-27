import { Body, Flex } from '@cognite/cogs.js';
import { EMPipelineRegexExtractor } from 'hooks/entity-matching-pipelines';

type ExtractorProps = {
  extractors: EMPipelineRegexExtractor[];
  entitySetToRender: EMPipelineRegexExtractor['entitySet'];
};

const Extractor = ({
  extractors,
  entitySetToRender,
}: ExtractorProps): JSX.Element => {
  const extractor = extractors.find(
    ({ entitySet }) => entitySet === entitySetToRender
  );

  if (extractor) {
    return (
      <Flex direction="column">
        <Body level={3} muted>
          {extractor.field}
        </Body>
        <Body level={2}>{extractor.pattern}</Body>
      </Flex>
    );
  }

  return <></>;
};

export default Extractor;
