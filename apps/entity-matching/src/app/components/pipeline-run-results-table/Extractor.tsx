import styled from 'styled-components';

import { Body, Flex } from '@cognite/cogs.js';

import { ColoredExtractor } from '../../utils/colored-rules';

type ExtractorProps = {
  extractors: ColoredExtractor[];
  entitySetToRender: ColoredExtractor['entitySet'];
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
            <Pattern>{extractor.pattern}</Pattern>
          </Flex>
        ))}
      </Flex>
    );
  }

  return <></>;
};

const Pattern = styled.div`
  font-size: 1.2em;
  font-weight: 500;
  font-family: monospace;
`;

export default Extractor;
