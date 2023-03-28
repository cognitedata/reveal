import { Body, Flex } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import { EMPipelineRunMatch, Pipeline } from 'hooks/entity-matching-pipelines';
import styled from 'styled-components';

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
              <Body level={3}>{sourcePropertyName}</Body>
              <Body level={2}>
                {sourcePropertyName &&
                typeof match.source?.[sourcePropertyName] === 'string' ? (
                  <>{match.source?.[sourcePropertyName]}</>
                ) : (
                  '-'
                )}
              </Body>
            </MatchFieldContainer>
            <MatchFieldContainer>
              <Body level={3}>{targetPropertyName}</Body>
              <Body level={2}>
                {targetPropertyName &&
                typeof match.target?.[targetPropertyName] === 'string' ? (
                  <>{match.target?.[targetPropertyName]}</>
                ) : (
                  '-'
                )}
              </Body>
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
