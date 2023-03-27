import { Body, Flex } from '@cognite/cogs.js';
import { EMPipelineRegexExtractor } from 'hooks/entity-matching-pipelines';

type PatternProps = {
  extractors: EMPipelineRegexExtractor[];
  entitySetToRender: EMPipelineRegexExtractor['entitySet'];
};

const Pattern = ({
  extractors,
  entitySetToRender,
}: PatternProps): JSX.Element => {
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

export default Pattern;
