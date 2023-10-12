import React, { FunctionComponent, ReactNode } from 'react';

import styled from 'styled-components';

import { Heading } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { LEARNING_AND_RESOURCES_URL } from '../../pages/Extpipes/Extpipes';
import { ExternalLink } from '../links/ExternalLink';

interface OwnProps {
  actionButton: ReactNode;
  isHostedExtractors: boolean;
}

type Props = OwnProps;

const NoExtpipes: FunctionComponent<Props> = ({
  actionButton,
  isHostedExtractors,
}) => {
  const { t } = useTranslation();

  return (
    <NoExtpipesWrapper>
      <StyledBorder>
        <Content>
          <Heading level={4}>
            {t('no-ext-pipeline-added', {
              context: isHostedExtractors && 'hosted',
            })}
          </Heading>
          <p>
            {t(`no-ext-pipeline-desc`, {
              context: isHostedExtractors && 'hosted',
            })}
            {!isHostedExtractors && (
              <ExternalLink href={LEARNING_AND_RESOURCES_URL}>
                &nbsp;{`${t('documentation', { postProcess: 'lowercase' })}`}
              </ExternalLink>
            )}
          </p>
          {actionButton}
        </Content>
      </StyledBorder>
    </NoExtpipesWrapper>
  );
};

const NoExtpipesWrapper = styled((props) => (
  <div {...props}>{props.children}</div>
))`
  grid-column: 1 / span 3;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledBorder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
  padding: 7rem 5rem;
  border: 3px dashed #ccc;
  border-radius: 1rem;
  width: 700px;
  height: 400px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 500px;
  height: 170px;
`;
export default NoExtpipes;
