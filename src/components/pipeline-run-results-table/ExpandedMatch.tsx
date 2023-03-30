import { Body, Flex } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import { EMPipelineRunMatch, Pipeline } from 'hooks/entity-matching-pipelines';
import styled from 'styled-components';
import ResourceCell from './ResourceCell';

type ExpandedMatchProps = {
  match: EMPipelineRunMatch;
  pipeline: Pipeline;
};

const ExpandedMatch = ({
  match,
  pipeline,
}: ExpandedMatchProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Container>
      <Body level={3} strong>
        {t('connected-fields')}
      </Body>
      {pipeline.modelParameters?.matchFields?.map(
        ({ source: sourcePropertyName, target: targetPropertyName }) => (
          <Flex key={`${sourcePropertyName}-${targetPropertyName}`}>
            <MatchFieldContainer>
              {sourcePropertyName && (
                <ResourceCell
                  preferredProperties={[sourcePropertyName]}
                  resource={match.source}
                />
              )}
            </MatchFieldContainer>
            <MatchFieldContainer>
              {targetPropertyName && (
                <ResourceCell
                  preferredProperties={[targetPropertyName]}
                  resource={match.target}
                />
              )}
            </MatchFieldContainer>
          </Flex>
        )
      )}
    </Container>
  );
};

const Container = styled(Flex).attrs({ direction: 'column', gap: 8 })`
  padding-left: 36px;
`;

const MatchFieldContainer = styled(Flex).attrs({ direction: 'column' })`
  flex: 1;
`;

export default ExpandedMatch;
