import styled from 'styled-components';

import { Body, Flex } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { ModelMapping } from '../../context/QuickMatchContext';
import {
  EMPipelineSource,
  EMPipelineTarget,
} from '../../hooks/entity-matching-pipelines';

import ResourceCell from './ResourceCell';

type ExpandedMatchProps = {
  source?: EMPipelineSource;
  target?: EMPipelineTarget;
  matchFields?: ModelMapping;
};

const ExpandedMatch = ({
  source,
  target,
  matchFields,
}: ExpandedMatchProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Container>
      <Body level={3} strong>
        {t('connected-fields')}
      </Body>
      {matchFields?.map(
        ({ source: sourcePropertyName, target: targetPropertyName }) => (
          <Flex key={`${sourcePropertyName}-${targetPropertyName}`}>
            <MatchFieldContainer>
              {sourcePropertyName && (
                <ResourceCell
                  preferredProperties={[sourcePropertyName]}
                  resource={source}
                />
              )}
            </MatchFieldContainer>
            <MatchFieldContainer>
              {targetPropertyName && (
                <ResourceCell
                  preferredProperties={[targetPropertyName]}
                  resource={target}
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
