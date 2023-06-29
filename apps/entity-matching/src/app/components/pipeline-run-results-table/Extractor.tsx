import { Body, Flex } from '@cognite/cogs.js';

import { EMPipelineRegexExtractor } from '@entity-matching-app/hooks/entity-matching-pipelines';

type ExtractorProps = {
  extractors: EMPipelineRegexExtractor[];
  entitySetToRender: EMPipelineRegexExtractor['entitySet'];
};

const Extractor = ({
  extractors,
  entitySetToRender,
}: ExtractorProps): JSX.Element => {
  const filteredExtractors = extractors.filter(
    ({ entitySet }) => entitySet === entitySetToRender
  );

  if (filteredExtractors.length > 0) {
    return (
      <Flex direction="column" gap={8}>
        {filteredExtractors.map((extractor) => (
          <Flex direction="column" key={extractor.field}>
            <Body level={3} muted>
              {extractor.field}
            </Body>
            <Body level={2}>{extractor.pattern}</Body>
          </Flex>
        ))}
      </Flex>
    );
  }

  return <></>;
};

export default Extractor;
